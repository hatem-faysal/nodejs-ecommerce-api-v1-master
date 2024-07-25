const slugify = require('slugify');
const asyncHandler = require('express-async-handler')
const ApiError = require('../utils/apiError');

const SubCategory = require('../models/subCategoryModel');

exports.setCategoryIdToBody = (req, res, next) => {
    //Nested route
    if(!req.body.category) req.body.category = req.params.categoryId;
    next();
}
//@desc    Create subCategory
//@route   POST /api/v1/subcategories
//@access  Private
exports.createSubCategory = asyncHandler(async (req, res)=>{
    const { name, category } = req.body;
    const subCategory = await SubCategory.create({
        name,
        slug: slugify(name),
        category
    });
    res.status(201).json({data: subCategory});
});
// Nested route
// GET /api/v1/categories/:categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
    let filterObject ={};
    if(req.params.categoryId) filterObject = { category: req.params.categoryId };
    req.filterObj = filterObject;
    next();
}
//@desc   Get list of subCategories
//@route  Get /api/v1/subCategories
//@access Public
exports.getSubCategories = asyncHandler(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;
    let filterObject ={};
    if(req.params.categoryId) filterObject = { category: req.params.categoryId };
    
    const Subcategories = await SubCategory.find(filterObject)
    .skip(skip)
    .limit(limit)
    // name-_id
    .populate({path:'category',select:'name'});
    // .populate({path:'category',select:'name-_id'});
    res.status(200).json({ results: Subcategories.length, data: Subcategories });
});

//@desc  Get specific subCategory by id
//@route GET /api/v1/subCategories/:id
//@access Public
exports.getSubCategory = asyncHandler( async (req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id).populate({
        path:'category',
        select:'name-_id'
    });
    if(!subCategory){
        // res.status(404).json({msg: `No category for this id ${id}`});
       return next(new ApiError(`No subcategory for this id ${id}`, 404));
    }
    res.status(200).json({ data: subCategory });
});


//@desc   Update specific subCategory
//@route  Put /api/v1/subcategories/:id
//@access Private
exports.updateSubCategory = asyncHandler (async(req, res, next) => {
    const { id } = req.params;  
    const { name } = req.body;
    const subCategory = await SubCategory.findOneAndUpdate(
        { _id: id },
        { name ,slug: slugify(name) },
        { new: true }
    )
    if(!subCategory){
        // res.status(404).json({msg: `No subCategory for this id ${id}`});
        return next(new ApiError(`No SubCategory for this id ${id}`, 404));
    }
    res.status(200).json({ data: subCategory });
});

//@desc   Delete specific subCategory
//@route  DELETE /api/v1/subCategories/:id
//@access Private
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findByIdAndDelete(id);

    if(!subCategory){
        // res.status(404).json({msg: `No subCategory for this id ${id}`});
        return next(new ApiError(`No subCategory for this id ${id}`, 404));
    }
    res.status(204).send();
});