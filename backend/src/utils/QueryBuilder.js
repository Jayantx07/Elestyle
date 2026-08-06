const mongoose = require('mongoose');

class QueryBuilder {
  /**
   * @param {mongoose.Query} query - The Mongoose query object (e.g. Product.find())
   * @param {Object} queryString - req.query object containing filter, sort, and pagination params
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString || {};
    this.filterConditions = {};
    this.isCursorPaginated = false;
  }

  /**
   * Reusable dynamic filter builder to replace repetitive if(field) checks across controllers
   * @param {Array} config - Array of filter configurations [{ field, param, type: 'exact'|'in'|'range'|'regex'|'boolean'|'array' }]
   */
  filter(config = []) {
    const queryObj = { ...this.queryString };
    // Exclude reserved navigation/sort/pagination keywords
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'after', 'before', 'cursor'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Apply pre-configured filter mapping rules
    config.forEach(({ param, field, type, customHandler }) => {
      const value = queryObj[param || field];
      if (value === undefined || value === '') return;

      const targetField = field || param;

      if (customHandler && typeof customHandler === 'function') {
        const customCond = customHandler(value, queryObj);
        if (customCond) Object.assign(this.filterConditions, customCond);
        delete queryObj[param || field];
        return;
      }

      switch (type) {
        case 'exact':
          this.filterConditions[targetField] = value;
          break;
        case 'in':
        case 'array':
          const values = Array.isArray(value) ? value : value.split(',').map((v) => v.trim());
          this.filterConditions[targetField] = { $in: values };
          break;
        case 'boolean':
          this.filterConditions[targetField] = value === 'true' || value === true;
          break;
        case 'regex':
          this.filterConditions[targetField] = { $regex: value, $options: 'i' };
          break;
        case 'number':
          this.filterConditions[targetField] = Number(value);
          break;
        default:
          this.filterConditions[targetField] = value;
      }

      delete queryObj[param || field];
    });

    // Handle universal price and discount ranges (e.g., minPrice, maxPrice, priceMin, priceMax)
    if (this.queryString.priceMin || this.queryString.min_price || this.queryString.priceMax || this.queryString.max_price) {
      this.filterConditions.price = {};
      if (this.queryString.priceMin || this.queryString.min_price) {
        this.filterConditions.price.$gte = Number(this.queryString.priceMin || this.queryString.min_price);
      }
      if (this.queryString.priceMax || this.queryString.max_price) {
        this.filterConditions.price.$lte = Number(this.queryString.priceMax || this.queryString.max_price);
      }
    }

    if (this.queryString.minRating || this.queryString.rating) {
      this.filterConditions.ratingAverage = { $gte: Number(this.queryString.minRating || this.queryString.rating) };
    }

    // Attach constructed conditions to Mongoose query
    if (Object.keys(this.filterConditions).length > 0) {
      this.query = this.query.find(this.filterConditions);
    }

    return this;
  }

  /**
   * Sort builder supporting universal displayOrder and multi-field criteria
   * @param {String} defaultSort - Default sort sequence if none specified
   */
  sort(defaultSort = 'displayOrder -createdAt') {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(defaultSort);
    }
    return this;
  }

  /**
   * Select specific document fields (projection)
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Universal Pagination Engine supporting both Offset (?page=2 & ?limit=20) and Cursor Pagination (?after=id or ?before=id)
   * Cursor pagination is essential for high-performance admin tables, feeds, and analytics without count overheads.
   */
  async paginate() {
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const { after, before, page } = this.queryString;

    // 1. Cursor Pagination Mode (High-performance large scale queries)
    if (after || before) {
      this.isCursorPaginated = true;
      const cursorCond = {};
      if (after && mongoose.Types.ObjectId.isValid(after)) {
        cursorCond._id = { $lt: new mongoose.Types.ObjectId(after) }; // Assuming descending order
      } else if (before && mongoose.Types.ObjectId.isValid(before)) {
        cursorCond._id = { $gt: new mongoose.Types.ObjectId(before) };
      }

      if (Object.keys(cursorCond).length > 0) {
        this.query = this.query.find(cursorCond);
      }

      this.query = this.query.limit(limit + 1); // Fetch 1 extra to check hasNextPage
      const rawResults = await this.query;
      
      const hasMore = rawResults.length > limit;
      const data = hasMore ? rawResults.slice(0, limit) : rawResults;
      const nextCursor = data.length > 0 && hasMore ? data[data.length - 1]._id : null;
      const prevCursor = data.length > 0 ? data[0]._id : null;

      return {
        data,
        pagination: {
          mode: 'cursor',
          limit,
          hasNextPage: hasMore,
          nextCursor,
          prevCursor,
        },
      };
    }

    // 2. Standard Offset Pagination Mode
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * limit;

    // Execute cloned query for document counting
    const totalQuery = this.query.model.countDocuments(this.query.getQuery());
    
    this.query = this.query.skip(skip).limit(limit);
    
    const [data, total] = await Promise.all([this.query, totalQuery]);

    return {
      data,
      total,
      page: currentPage,
      pages: Math.ceil(total / limit) || 1,
      pagination: {
        mode: 'offset',
        currentPage,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        limit,
      },
    };
  }
}

module.exports = QueryBuilder;
