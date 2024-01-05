export type Obj = Record<string, string>

export type InterpretOptionalModifier<Param extends string> =
  Param extends `${infer Name}?`
    ? { [T in Name]?: string }
    : { [T in Param]: string }
export type InterpretGreedyModifier<Param extends string> =
  Param extends `${infer Name}+`
    ? { [T in Name]: string }
    : InterpretOptionalModifier<Param>

export type InterpretModifiers<Param extends string> =
  InterpretGreedyModifier<Param>

export type InferEndBasicParam<
  T extends string,
  Or = Obj
> = T extends `${string}/:${infer Param}` ? InterpretModifiers<Param> : Or

export type InferExtensionParam<
  T extends string,
  Or = Obj
> = T extends `${infer Prefix}.:${infer Param}`
  ? InterpretModifiers<Param> & InferEndBasicParam<Prefix, Or>
  : InferEndBasicParam<T, Or>

export type InferMiddleBasicParam<
  T extends string,
  Or = Obj
> = T extends `${string}/:${infer Param}/${infer After}`
  ? InterpretModifiers<Param> & InferMiddleBasicParam<`/${After}`, Or>
  : InferExtensionParam<T, Or>

export type InferParams<T extends string> = InferMiddleBasicParam<
  T,
  unknown
> extends Obj
  ? InferMiddleBasicParam<T, unknown>
  : Obj
