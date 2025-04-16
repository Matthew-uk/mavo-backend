class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        this.page = 1;
        this.docs_per_page = 10;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'populate'];
        excludedFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin|ne|eq|regex|exists|all|size|mod|options)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v -reviews -updatedAt');
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.page = page;
        this.docs_per_page = limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    populate() {
        if (this.queryString.populate) {
            const populateFields = this.queryString.populate.split(',').join(' ');
            this.query = this.query.populate(populateFields);
        }
        return this;
    }

    metaData() {
        return { 
            page: this.page, 
            docs_per_page: this.docs_per_page, 
            total_no_of_documents: this.total_no_of_documents 
        };
    }
}

export default APIFeatures;