const ctrlWrapper = ctrl => {
    const func = async (req, res, next) => {
        try {
            await ctrl(req, res)
        } catch (error) {
                    console.log(error.message);

            next(error)
        }
    }
    return func
}

module.exports = ctrlWrapper