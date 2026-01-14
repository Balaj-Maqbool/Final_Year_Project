import { ApiError } from "./ApiError.js";

const throwIfInvalid = (condition, status = 400, message = "Invalid Field") => {
    if (condition) throw new ApiError(status, message);
};

const cleanQuotedString = (input) => {
    let str = input.trim();
    while (
        (str.startsWith('"') && str.endsWith('"')) ||
        (str.startsWith("'") && str.endsWith("'"))
    ) {
        str = str.slice(1, -1).trim(); // clean the Deep Quoted strings like '   "   balaj " ' or '  " balaj "  ' return balaj
    }
    return str;
};



export { throwIfInvalid, cleanQuotedString };

