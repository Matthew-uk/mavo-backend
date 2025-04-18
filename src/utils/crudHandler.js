import APIFeatures from "./apiFeatures.js";
import AppError from "./appError.js";
import catchAsyncHandler from "./catchAsyncHandler.js";

export const getAll = (Model, defaultPopulate = "") =>
  catchAsyncHandler(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate(req.query.populate || defaultPopulate);

    const totalDocuments = await Model.countDocuments(features.queryObj);
    const meta = {
      ...features.metaData(),
      total_no_of_documents: totalDocuments,
      last_page: Math.ceil(totalDocuments / features.metaData().docs_per_page),
    };

    const docs = await features.query;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: { documents: docs, meta },
    });
  });

export const getOne = (Model) =>
  catchAsyncHandler(async (req, res, next) => {
    const doc = await Model.findOne(req.params)
      .select("-updatedAt")
      .populate(req.query.populate);

    if (!doc) return next(new AppError(`No document found with that ID`, 404));

    res.status(200).json({
      status: "success",
      data: { document: doc },
    });
  });

export const createNew = (Model, options = {}) =>
  catchAsyncHandler(async (req, res, next) => {
    console.log(req.body)

    // Handle file uploads if specified
    if (options.fileField && req.file) {
      req.body[options.fileField] = req.file.path.replace("public/", ""); // Store relative path
    }

    if (options.fileFields && req.files) {
      options.fileFields.forEach((field) => {
        if (req.files[field]) {
          req.body[field] = req.files[field][0].path.replace("public/", ""); // Store relative path
        }
      });
    }

    // Create and save the document
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: { document: newDoc },
    });
  });

export const updateOne = (Model, options = {}) =>
  catchAsyncHandler(async (req, res, next) => {
    let updateData = { ...req.body };

    // Handle file uploads dynamically
    if (options.fileField && req.file) {
      updateData[options.fileField] = req.file.path.replace("public/", "");
    }

    if (options.fileFields && req.files) {
      options.fileFields.forEach((field) => {
        if (req.files[field]) {
          updateData[field] = req.files[field][0].path.replace("public/", "");
        }
      });
    }

    // Handle specific updates (e.g., pushing reactions into an array)
    if (options.updateField) {
      const doc = await Model.findById(req.params.id);
      if (!doc)
        return next(new AppError(`No document found with that ID`, 404));

      if (Array.isArray(doc[options.updateField])) {
        // Push new data into array fields (e.g., reactions)
        doc[options.updateField].push(req.body[options.updateField]);
        await doc.save();
        return res.status(200).json({
          status: "success",
          data: { document: doc },
        });
      } else {
        updateData[options.updateField] = req.body[options.updateField]; // Standard update
      }
    }

    const updatedDoc = await Model.findOneAndUpdate(
      req.params,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-updatedAt");

    if (!updatedDoc)
      return next(new AppError(`No document found with that ID`, 404));

    res.status(200).json({
      status: "success",
      data: { document: updatedDoc },
    });
  });

export const deleteOne = (Model) =>
  catchAsyncHandler(async (req, res, next) => {
    const doc = await Model.findOneAndDelete(req.params);

    if (!doc) return next(new AppError(`No document found with that ID`, 404));

    res.status(204).json({
      status: "success",
      message: "Successfully deleted document",
    });
  });
