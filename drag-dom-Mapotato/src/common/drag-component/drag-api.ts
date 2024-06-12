export enum PositionEnum {
  横向偏移 = 'left',
  纵向偏移 = 'top',
}
export enum LimitPositionEnum {
  横向偏移 = 'limitLeft',
  纵向偏移 = 'limitTop',
  宽 = 'limitWidth',
  高 = 'limitHeight',
}
/**
 * 本体位置信息类型定义
 */
export type PositionType = Record<PositionEnum, number>;
/**
 * 限制区域位置信息类型定义
 */
export type limitAreaType = Record<LimitPositionEnum, number>;
