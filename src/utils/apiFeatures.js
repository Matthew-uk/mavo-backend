class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
      this.page = 1;
      this.docs_per_page = 10;
    }
  
    // Helper to cast types and split arrays when needed
    static _cast(op, val) {
      // Array operators expect a list
      const arrayOps = new Set(['in','nin','all']);
      if (arrayOps.has(op) && typeof val === 'string') {
        return val.split(',').map(v => APIFeatures._cast(null, v));
      }
  
      // mod expects [divisor, remainder]
      if (op === 'mod' && typeof val === 'string') {
        return val.split(',').map(v => +v);
      }
  
      // Basic casting
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === 'null') return null;
      if (!isNaN(val) && val !== '') return +val;
      return val;
    }
  
    filter() {
      const excluded = ['page','sort','limit','fields','populate'];
      const criteria = {};
  
      Object.entries(this.queryString).forEach(([key, val]) => {
        if (excluded.includes(key)) return;
  
        // operator style: ?field[op]=value
        if (val !== null && typeof val === 'object') {
          const sub = {};
          Object.entries(val).forEach(([op, raw]) => {
            const v = APIFeatures._cast(op, raw);
  
            if (op === 'eq') {
              // eq=undefined → missing field
              if (raw === 'undefined') sub.$exists = false;
              else sub.$eq = v;
            } else {
              sub[`$${op}`] = v;
            }
          });
          criteria[key] = sub;
        }
        // simple equality: ?field=value
        else {
          criteria[key] = APIFeatures._cast(null, val);
        }
      });
  
      this.query = this.query.find(criteria);
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        this.query = this.query.select(this.queryString.fields.split(',').join(' '));
      } else {
        this.query = this.query.select('-__v -updatedAt');
      }
      return this;
    }
  
    paginate() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 10;
      this.page = page;
      this.docs_per_page = limit;
      this.query = this.query.skip((page - 1) * limit).limit(limit);
      return this;
    }
  
    populate() {
      if (this.queryString.populate) {
        this.query = this.query.populate(this.queryString.populate.split(',').join(' '));
      }
      return this;
    }
  
    metaData() {
      return {
        page: this.page,
        docs_per_page: this.docs_per_page
      };
    }
  }
  
  export default APIFeatures;
  