# React Ecosystem

- [React](#react)
- [Redux](#redux)
  - [Tooling](#tooling)
  - [Data Flow](#data-flow)
  - [Action / Reducer](#action--reducer)
  - [`configureStore(OPTIONS)`](#configurestoreoptions)
  - [With React](#with-react)
  - [`createSlice(OPTIONS)`](#createsliceoptions)
  - [`createAsyncThunk`](#createasyncthunk)
- [React Router v6.26](#react-router-v626)
  - [Data API](#data-api)
  - [Legacy](#legacy)
- [Styled Component v6.1](#styled-component-v61)
  - [Flow](#flow)
  - [`styled`](#styled)
  - [`<STYLED_COMPONENT />`](#styled_component-)
  - [`<ThemeProvider />`](#themeprovider-)
  - [Helper](#helper)
  - [Tool](#tool)

## React

- component
  - should be pure
    - does not update existed variables before called
    - same input same output
    - no asynchronous logic
  - [event delegation from the root](https://legacy.reactjs.org/blog/2020/10/20/react-v17.html#changes-to-event-delegation)
- JSX
  - curly braces
    - between tags / as attributes
    - escape special characters
- VDOM
  - the in-memory representation of the actual DOM
- screen update
  1. trigger: on state updated
  2. render: call components whose state updated
  3. reconciliate: caculate the difference between the renders
  4. commit: apply the difference to the DOM nodes

## Redux

manages global state centrally

### Tooling

- `@reduxjs/toolkit`
- `react-redux`
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension)

### Data Flow

- initial state
  1. caculated from the root reducer
  2. passed to all subscribed UI
- when the store is dispatched an action
  1. reduces the action and the old state to the new state
  2. notifies all subscribed UI

### Action / Reducer

- `ACTION`
  - property
    - `type: 'STATE_NAME/EVENT'`
    - `payload?: any | Error`
    - `error?: boolean`
    - `meta?`
  - `ACTION_CREATOR: (...args) => ACTION`
  - `PREPARE_ACTION: (...args) => Omit<ACTION, 'type'>`
- `THUNK` / `THUNK_ACTION`
  - `(dispatch, getState) => void`
  - `THUNK_ACTION_CREATOR: (...args) => THUNK`
- `CASE_REDUCER`
  - should be pure
  - supports mutation by `immer`
    - `(state, action: PayloadAction<PAYLOAD_TYPE>) => void`
    - to prdouce new `STATE` [return it without modifying `state`](https://immerjs.github.io/immer/return)
  - supports async by middlewares
- selector <!-- todo: purpose -->
  - slice seletors
  - `useSeletor`
- middleware
  - executed between actions dipatched and reach reducers

### `configureStore(OPTIONS)`

- `reducer: ROOT_REDUCER | ReducersMapObject`
  - `ReducersMapObject`
    - `{ STATE_NAME: SLICE_REDUCER }`
    - passed to `combineReducers`
- `middleware?`
- `devTools?`
- `preloadedState?`
- `enhancers?`

returns

- `.getState()`
- `.dispatch(ACTION | ACTION_CREATOR() | )`

### With React

- `<Provider store={STORE}> />`
  - avoid direct import to prevnet circular import
  - allow multiple store instances for testing
- `useSelector`
  - triggers a re-render only if
    - new `SELECTED` `!==` old `SELECTED`
  - `(SELECTOR)`
    - `SLICE.selectors.NAME`
    - `(rootState) => SELECTED`
  - `.withType<ReturnType<typeof STORE.getState>>`
- `useDispatch`
  - `(ACTION | ACTION_CREATOR())`
  - `.withType<typeof STORE.dispatch>`

### `createSlice(OPTIONS)`

a global state may consist of multiple slices

- `name` as the `STATE_NAME`
- `initialState`
- `reducers`
  - `{EVENT: CASE_REDUCER}`
  - `{EVENT: {}}`
    - `reducer: CASE_REDUCER`
    - `prepare: PREPARE_ACTION`
  - `(creators) => ({EVENT: creators.METHOD()})`
    - `.reducer(CASE_REDUCER)`
    - `.preparedReducer(PREPARE_ACTION)`
    - `.asyncThunk`
  - `extraReducers: (builder) => builder.METHOD()`
    - `.addCase(ACTION.type | ACTION_CREATOR, CASE_REDUCER)`
    - `.addMatcher`
    - `.addDefaultCase`
- `selectors`
  - `{SELETOR_NAME: (slicetState) => SELECTED}`

returns

- `.reducer` a slice reducer for `ReducersMapObject`
- `.actions` action creators created from `OPTIONS.reducers`

### `createAsyncThunk`

```javascript
const fetcher = createAsyncThunk(...args);

fetcher(INPUT);
```

- `args`
  - `ACTION.type`
  - `async (INPUT, thunkAPI) => Promise?<ACTION.payload>`
  - `OPTIONS`
- `fetcher`
  - `.pending`
  - `.fulfilled`
  - `.rejected`

## React Router v6.26

### [Data API](https://reactrouter.com/en/main/routers/picking-a-router#data-apis)

- router
  - `createBrowserRouter()`
  - `createHashRouter()`
- hook
  - `useLoaderData()`
    - returns `Route.loader()`
    - revalidates after `Route.action` called
- component
  - `<Form>` / `<fetcher.Form>` when submitted
    1. calls `Route.action({ params, request: Request })`
    2. revalidates all of the loader data on the page
    3. (`<Form>` only) navigates

### Legacy

- component
  - `<Outlet>` render `Route.children`

## [Styled Component v6.1](https://styled-components.com/docs/basics)

### Flow

1. generate a stylesheet
2. attach classes to the DOM nodes
3. append a `<style>` to the `<head>`

### `styled`

- `.TAGNAME`
- `(COMPONENT)` Styled or React
  - [`.attrs`](https://styled-components.com/docs/api#.attrs)
    - `(MERGED_PROPS)`
    - `((props) => MERGED_PROPS)`
  - `` `STYLE_KEY: STYLE_VAL;` ``
  - `` `STYLE_KEY: ${(props) => STYLE_VAL};` ``
  - `` `${(props) => `STYLE_KEY: STYLE_VAL;`}` ``
  - `` `${STYLED_COMPONENT}` `` `STYLED_COMPONENT`'s unique class name
  - `(RULES)`
  - `((props) => RULES)`

> ignores interpolations that evaluate to `undefined` `null` `false` `""`

### `<STYLED_COMPONENT />`

- `as='NEW_TAG_NAME'`
- `forwardedAs='CHILD_NEW_TAG_NAME'`
- `$TRANSIENT={CONSUMED_BY_STYLED_COMPONENTS}`

### `<ThemeProvider />`

- `theme={THEME}`
- `theme={(outerTheme) => ({ ...outerTheme, ...THEME })}`
- `` styled.TAGNAME`${(props) => props.theme == THEME}` ``

### Helper

```javascript
// keyframes
const rotate = keyframes`to { rotate: 1turn; }`;
// css
const styles = css`
  animation: ${rotate} 2s linear infinite;
`;
// withTheme
// isStyledComponent
// useTheme
const NonStyledComponent = (() => {
  function Component(props) {
    const theme = useTheme();

    console.group("");

    // is styled component: false
    console.log(
      `is styled component: ${isStyledComponent(Component)}`,
    );
    // theme: {border: '1px solid sandybrown'}
    console.log("theme:", props.theme);
    // or
    console.log("theme:", theme);

    console.groupEnd();
  }

  return withTheme(Component);
})();
```

### Tool

- [SSR](https://styled-components.com/docs/advanced#server-side-rendering)
- [Babel Plugin](https://styled-components.com/docs/tooling#babel-plugin)
  - SSR surport
  - minification
  - nicer debugging
