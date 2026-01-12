import { ApiError } from "./ApiError.js";

const promiseAsyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
    // console.log("\n\n\n promise requestHandler response \n\n",res);
}; // returning implicitly another  wrapper function // don't need to return explicitly

const trycatchAsyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next);
    } catch (error) {
        throw new ApiError(400, error?.message || "Unauthorized access,Token expired");
    }
};

export { promiseAsyncHandler, trycatchAsyncHandler };

// const asyncHandler = (fun) => {
//     return async (req, res, next) => {
//         try {
//             await fun(req, res, next)
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }
// }

// } // both are same
