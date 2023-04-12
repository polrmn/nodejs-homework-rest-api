const ctrlWrapper = require('../utils/ctrlWrapper')
const Contact = require('../models/contact')
const { addSchema, updateFavoriteSchema } = require('../schemas/contacts')
const HttpError = require('../helpers/HttpError')


const getAll = async (req, res) => {
    const { _id: owner } = req.user;
    const {page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;
    const result = await Contact.find({owner}, '-createdAt -updatedAt', {skip, limit}).populate('owner', 'name email');
    res.json(result);
};

const getById = async (req, res) => {
    const {id} = req.params;
    const result = await Contact.findById(id);
    if (result === null) {
      throw HttpError(404);
    }
    res.status(200).json(result);
};

const add = async (req, res) => {
    const { _id: owner } = req.user;
    const { error } = addSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const result = await Contact.create({...req.body, owner});
    res.status(201).json(result);
};

const deleteById = async (req, res) => {
    const { id } = req.params;
    const result = await Contact.findByIdAndDelete(id);
    if (!result) {
      throw HttpError(404);
    }
    res.json({ message: "contact deleted" });
};

const updateById = async (req, res) => {
    const { error } = addSchema.validate(req.body);
    if (error) {
      throw HttpError(400, (message = "missing fields"));
    }
    const { id } = req.params;
    const result = await Contact.findByIdAndUpdate(id, req.body, {new: true});
    if (!result) {
      throw HttpError(404);
    }
    res.json(result);
};

const updateFavorite = async (req, res) => {
  const { error } = updateFavoriteSchema.validate(req.body);
  if (error) {
    throw HttpError(400, (message = "missing fields"));
  }
  const { id } = req.params;
  const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });
  if (!result) {
    throw HttpError(404);
  }
  res.json(result);
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
  updateFavorite: ctrlWrapper(updateFavorite),
};


