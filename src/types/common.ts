export type QuerySuccessDataType<QueryFn> = QueryFn extends () => {
  data: infer Data;
}
  ? Exclude<Data, undefined>
  : unknown;
