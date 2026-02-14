// === Libs ===

// === Internal ===

let missingUserCreationVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for user creation!",
        time: new Date()
    }
}

let missingUsernameErasementVariable = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for user deletion!",
        time: new Date()
    }
}

let missingBugErasementVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for bug deletion!",
        time: new Date()
    }
}

let missingReportErasementVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for bug deletion!",
        time: new Date()
    }
}

let missingBugCreationVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for user creation!",
        time: new Date()
    }
}

let missingReportCreationVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for report creation!",
        time: new Date()
    }
}

let missingSendMSGVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for sending a msg!",
        time: new Date()
    }
}

let missingCreateSuspectionVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for creating a suspection!",
        time: new Date()
    }
}

let missingDeleteSuspectionsVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for deleting a suspection!",
        time: new Date()
    }
}

let missingSuspectionEditVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for editing a suspection!",
        time: new Date()
    }
}

let missingDeleteMSGVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for deleting a msg!",
        time: new Date()
    }
}

let missingNewsCreationVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for writing a news article!",
        time: new Date()
    }
}

let missingNewsEditVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for editing a news article!",
        time: new Date()
    }
}

let missingNewsDeletionVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the needed body variables for deleting a news article!",
        time: new Date()
    }
}

let internalServerError = {
    error: true,
    success: false,
    main: {
        msg: "500 - Internal server error",
        time: new Date()
    }
}

let wrongPassword = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please enter the valid password!",
        time: new Date()
    }
}

let missingTokenHeader = {
    error: true,
    success: false,
    main: {
        msg: "401 - Please enter a token in the headers!",
        time: new Date()
    }
}

let invalidToken = {
    error: true,
    success: false,
    main: {
        msg: "403 - Invalid token!",
        time: new Date()
    }
}

let unauthorizedAccess = {
    error: true,
    success: false,
    main: {
        msg: "403 - Unauthorized access!",
        time: new Date()
    }
}

let unknownMsg = {
    error: true,
    success: false,
    main: {
        msg: "400 - Unknown msg!",
        time: new Date()
    }
}

let unknownNewsArticle = {
    error: true,
    success: false,
    main: {
        msg: "400 - Unknown news article!",
        time: new Date()
    }
}

let levelTooHigh = {
    error: true,
    success: false,
    main: {
        msg: "400 - Level too high!",
        time: new Date()
    }
}

let missingKickPlayerVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the player name for kick action!",
        time: new Date()
    }
}

let missingBanPlayerVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the player name for ban action!",
        time: new Date()
    }
}

let missingTempbanPlayerVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the player name and time for tempban action!",
        time: new Date()
    }
}

let missingWarnPlayerVariables = {
    error: true,
    success: false,
    main: {
        msg: "400 - Please include the player name for warn action!",
        time: new Date()
    }
}

// === Exporting ===
module.exports = {
    missingUserCreationVariables,
    internalServerError,
    missingUsernameErasementVariable,
    wrongPassword,
    missingTokenHeader,
    invalidToken,
    missingBugCreationVariables,
    missingBugErasementVariables,
    missingReportCreationVariables,
    missingReportErasementVariables,
    missingSendMSGVariables,
    missingDeleteMSGVariables,
    unknownMsg,
    missingNewsCreationVariables,
    levelTooHigh,
    missingNewsDeletionVariables,
    unknownNewsArticle,
    unauthorizedAccess,
    missingNewsEditVariables,
    missingCreateSuspectionVariables,
    missingDeleteSuspectionsVariables,
    missingSuspectionEditVariables,
    missingKickPlayerVariables,
    missingBanPlayerVariables,
    missingTempbanPlayerVariables,
    missingWarnPlayerVariables
}