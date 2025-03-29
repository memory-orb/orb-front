import { AccessControlConditions, AccsDefaultParams, AccsOperatorParams } from "@lit-protocol/types";

type AccessControlCondition = AccsDefaultParams | AccsOperatorParams | AccessControlConditions;

export const isOperatorCondition = (condition: AccessControlCondition): condition is AccsOperatorParams => {
  return condition && typeof condition === 'object' && 'operator' in condition;
}

export const isNormalCondition = (condition: AccessControlCondition): condition is AccsDefaultParams => {
  return condition && typeof condition === 'object' && !Array.isArray(condition) && 'chain' in condition;
}

export const isConditionsGroup = (condition: AccessControlCondition): condition is AccessControlConditions => {
  return Array.isArray(condition);
}