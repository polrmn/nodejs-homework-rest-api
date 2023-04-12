const express = require('express');
const {
  getAll,
  getById,
  add,
  deleteById,
  updateById,
  updateFavorite
} = require("../../controllers/contacts");
const validateBody = require('../../utils/validateBody')
const { addSchema, updateFavoriteSchema } = require("../../schemas/contacts");
const isValidId = require('../../middlewares/isValidId');
const authenticate = require('../../middlewares/authenticate');

const router = express.Router();

router.get("/", authenticate, getAll);

router.get("/:id", authenticate, isValidId, getById);

router.post("/", authenticate, validateBody(addSchema), add);

router.delete("/:id", authenticate, isValidId, deleteById);

router.put(
  "/:id",
  authenticate,
  isValidId,
  validateBody(addSchema),
  updateById
);

router.patch(
  "/:id/favorite",
  authenticate,
  isValidId,
  validateBody(updateFavoriteSchema),
  updateFavorite
);

module.exports = router
