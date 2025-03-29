import { isConditionsGroup } from "@/utils/type-checker";
import {
  AccessControlConditions,
  AccsDefaultParams,
  AccsOperatorParams,
} from "@lit-protocol/types";

export type AccessControlCondition =
  | AccsDefaultParams
  | AccsOperatorParams
  | AccessControlConditions;

export type ArweaveData = {
  ciphertext: string;
  dataToEncryptHash: string;
  originalFileName: string;
};

export class AccessControlConditionWrapper {
  private _originalCondition: AccessControlCondition;
  private _subWrapper: AccessControlConditionWrapper[] | null = null;

  constructor(condition: AccessControlCondition) {
    this._originalCondition = condition;
    if (isConditionsGroup(condition)) {
      this._originalCondition = condition;
      this._subWrapper = condition.map((subCondition) => {
        return new AccessControlConditionWrapper(subCondition);
      });
    }
  }

  get condition() {
    return this._originalCondition;
  }

  setCondition(condition: AccessControlCondition) {
    console.log("setCondition", condition);
    this._originalCondition = condition;
    if (this._subWrapper instanceof AccessControlConditionWrapper) {
      this._subWrapper?.setCondition(condition);
    }
  }

  get conditionWrapper() {
    return this._subWrapper;
  }
}

export interface ChatRecord {
  role: "ai" | "user";
  content: string;
}