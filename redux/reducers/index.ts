import {combineReducers, AnyAction} from "@reduxjs/toolkit";
import {HYDRATE} from "next-redux-wrapper";
//import {diff} from "jsondiffpatch";

import {daoReducer} from "@redux/reducers/dao";
import {userReducer} from "@redux/reducers/user";

const reducer = combineReducers({
    daos: daoReducer,
    user: userReducer,
});

const finalReducer = (state: ReturnType<typeof reducer>, action: AnyAction) => {
    if (action.type === HYDRATE) {
        return state;
    } else {
        return reducer(state, action);
    }
};

export default finalReducer;
