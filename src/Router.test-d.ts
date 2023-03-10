import { ParseRouteParameters } from 'Router';
import { it, describe, expectTypeOf } from 'vitest';

describe('route param parsing', () => {
  it('parses route without params correctly', () => {
    const route = '/foo/bar';
    expectTypeOf<ParseRouteParameters<typeof route>>().toEqualTypeOf<{}>();
  });

  it('parses route with params correctly', () => {
    const route = '/foo/:bar/:id';
    expectTypeOf<ParseRouteParameters<typeof route>>().toEqualTypeOf<{ bar: string; id: string }>();
  });

  it('parses route with optional param correctly', () => {
    const route = '/foo/:bar/:id?';
    expectTypeOf<ParseRouteParameters<typeof route>>().toEqualTypeOf<{ bar: string; id: undefined | string }>();
  });

  it('parses route with catch-all param correctly', () => {
    const route = '/foo/:bar/:rest+';
    expectTypeOf<ParseRouteParameters<typeof route>>().toEqualTypeOf<{ bar: string; rest: undefined | string }>();
  });

  it('ignores inference with wildcard', () => {
    const route = '*';
    expectTypeOf<ParseRouteParameters<typeof route>>().toEqualTypeOf<{ [key: string]: string | undefined }>();
  });

  it('infers params but allows any param with slash wildcard', () => {
    const route = '/foo/:bar/:buzz/*';
    expectTypeOf<ParseRouteParameters<typeof route>>().toEqualTypeOf<
      { bar: string; buzz: string; } & { [key: string]: string | undefined }
    >();
  });

  it('infers params but allows any param with slash-less wildcard', () => {
    const route = '/foo/:bar/:buzz*';
    expectTypeOf<ParseRouteParameters<typeof route>>().toEqualTypeOf<
      { bar: string; buzz: string; } & { [key: string]: string | undefined }
    >();
  });
});
