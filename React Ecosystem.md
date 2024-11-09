# React Ecosystem

- [React](#react)
  - [Re-render](#re-render)
- [Redux](#redux)
  - [Tooling](#tooling)
  - [Data Flow / Term](#data-flow--term)
  - [Store](#store)
  - [With React](#with-react)
  - [Action / Reducer / Selector](#action--reducer--selector)
  - [Asynchronize](#asynchronize)
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
  1. `trigger` on state updated
  2. `render` call components whose state updated
  3. `reconciliate` caculate the difference between the renders
  4. `commit` apply the difference to the DOM nodes

### Re-render

a component

- re-renders whenever
  - not passed to its parent by `children`
  - [its parent re-renders](https://react.dev/reference/react/memo#skipping-re-rendering-when-props-are-unchanged)
- could be wrapped with `React.memo` if its re-renders
  - take the same props compared by `Object.is`
  - cost expensive logic / perceptible lag

## Redux

manages global state centrally

### Tooling

- `@reduxjs/toolkit`
  - `immer`
  - `reselect`
- `react-redux`
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension)

### Data Flow / Term

- initial state
  1. caculated from the root reducer
  2. passed to all subscribed UI
- when the store is dispatched an action
  1. reduces the action and the old state to the new state
  2. notifies all subscribed UI
- `ACTION`
  - property
    - `type: 'STATE_NAME/EVENT'`
    - `payload?: any | Error`
    - `error?: boolean`
    - `meta?`
  - `ACTION_CREATOR: (...args) => ACTION`
  - `PREPARE_ACTION: (...args) => Omit<ACTION, 'type'>`
- `THUNK` / `THUNK_ACTION`
  - `THUNK / THUNK_ACTION: (dispatch, getState) => void`
  - `THUNK_CREATOR: (arg) => THUNK`
  - see `createAsyncThunk`
- `CASE_REDUCER`
  - should be pure
  - supports mutation by `immer`
    - `(state, action: PayloadAction<ACTION.payload>) => void`
    - to prdouce new `STATE` [return it without modifying `state`](https://immerjs.github.io/immer/return)
- selector <!-- todo: purpose -->
- middleware
  - executed between an action dispatched and reduced
  - `redux-thunk` enables `store.dispatch(THUNK)`

### Store

#### [`configureStore(OPTIONS)`](https://redux-toolkit.js.org/api/configureStore)

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
- `.dispatch`
  - `(ACTION): ACTION`
  - `(THUNK)` see `createAsyncThunk`

#### [`createSlice(OPTIONS)`](https://redux-toolkit.js.org/api/createSlice)

a global state may consist of multiple slices

- `name: STATE_NAME`
- `initialState`
- `reducers`
  - `{EVENT: CASE_REDUCER}`
  - `{EVENT: {}}`
    - `reducer: CASE_REDUCER`
    - `prepare: PREPARE_ACTION`
  - `(creators) => ({EVENT: creators.METHOD()})`
    - `.reducer(CASE_REDUCER)`
    - `.preparedReducer(PREPARE_ACTION, CASE_REDUCER)`
    - `.asyncThunk(PAYLOAD_CREATOR, {})`
      - `options: THUNK_OPTIONS`
      - `pending | fulfilled | rejected: CASE_REDUCER`
  - `extraReducers: (builder) => builder.METHOD()`
    - handle actions created beyond this slice
    - `.addCase(ACTION.type | ACTION_CREATOR, CASE_REDUCER)`
    - `.addMatcher`
    - `.addDefaultCase`
- `selectors`
  - `{SELETOR_NAME: (slicetState) => SELECTED}`

returns

- `.reducer` a slice reducer for `ReducersMapObject`
- `.actions` action creators created from `OPTIONS.reducers`
- `.selectors`

### With React

- `<Provider store={STORE}> />`
  - avoid direct import to prevnet circular import
  - allow multiple store instances for testing
- `useSelector(SELECTOR, equalityFnOrOptions?)`
  - `SELECTOR`
    - `SLICE.selectors.NAME`
    - `(rootState) => SELECTED`
  - triggers a re-render only if
    - new `SELECTED` `!==` old `SELECTED`
  - `.withType<RootState>()`
- `useDispatch`
  - `.withType<AppDispatch>()`
  - see `.dispatch`

given

- `type RootState = ReturnType<typeof STORE.getState>`
- `type AppDispatch = typeof STORE.dispatch`

### Action / Reducer / Selector

#### [`createSelector`](https://reselect.js.org/api/createSelector)

for creating memoized selectors

```javascript
// slice.ts
// output selector
export const selectPostsByUser = createSelector(
  // input selectors
  [selectAllPosts, (state: RootState, userId: string) => userId],
  // one result function
  (posts, userId) => posts.filter((post) => post.user === userId),
);

// page.tsx
const postsByUser = useAppSelector((state) =>
  selectPostsByUser(state, userId),
);
```

- input selector
  - returns extracted value
- output selector
  - changes the return value only when the extracted values have changed
  - prevents unnecessary re-renders

#### [`createEntityAdapter`](https://redux-toolkit.js.org/api/createEntityAdapter)

for

- normalizing entities
  - no duplicated entity
  - entities kept in a lookup table
- generated
  - CRUD reducers
  - memoized selectors

```typescript
// slice.ts
const adapter = createEntityAdapter<Entity>({
  selectId ?? (entity) => entity.id,
  sortComparer ?? false,
});

const initialState: State = adapter.getInitialState({
  // props additional to
  // ids: []
  // entities: {}
}, [
  // initial entities
]);

const slice = createSlice({
  initialState,
  selectors: { ...adapter.getSelectors() },
  extraReducers(builder) {
    builder.addCase(THUNK_CREATOR.fulfilled, adapter.addOne);
  },
});

export const { selectAll } = postsSlice.selectors;
// or
export const {
  selectAll,
} = postsAdapter.getSelectors((state: RootState) => state.posts);
```

- `adapter`
  - `.getInitialState()`
  - `.getSelectors()` created with `createSelector`
  - `.addOne()` [CRUD reducer](https://redux-toolkit.js.org/api/createEntityAdapter#crud-functions)
    - `State`
    - `Entity | PayloadAction<Entity>`

|        | One | Many | All |
| ------ | --- | ---- | --- |
| add    | ✓   | ✓    |     |
| set    | ✓   | ✓    | ✓   |
| remove | ✓   | ✓    | ✓   |
| update | ✓   | ✓    |     |
| upsert | ✓   | ✓    |     |

### Asynchronize

#### [`createAsyncThunk`](https://redux-toolkit.js.org/api/createAsyncThunk)

for dispatching actions with asynchronous logic

```javascript
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

// slice.ts
const thunkCreator = createAppAsyncThunk(
  // TYPE
  'STATE/EVENT',
  // PAYLOAD_CREATOR
  async (arg, thunkAPI) => {
    // arg == ID;
    return (await fetch(arg)).json();
  },
  THUNK_OPTIONS,
);

// page.tsx
const thunk = thunkCreator(ID);
const thunkResult = useDispatch()(thunk);
```

- `PAYLOAD_CREATOR`
  - `async (arg, thunkAPI) => Promise<ACTION.payload>`
- `thunkAPI`
  - `dispatch`
  - `getState`
  - `extra`<!-- todo: the "extra argument" given to the thunk middleware on setup -->
  - `requestId` a generated ID to identify each request
  - `signal` as [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
  - to provide additional `meta` for the action returned by `await thunkResult`
    - return `rejectWithValue(VALUE, [META])`
    - return / throw `fulfillWithValue(VALUE, [META])`
- `THUNK_OPTIONS`
  - `condition`
    - `(arg, { getState, extra }): Promise?<boolean>`
    - return `false` to cancel `thunk`
  - ...
- `thunkCreator`
  - `.{pending | fulfilled | rejected}`
    - returns `ACTION_CREATOR`
    - for `extraReducers`
- `thunkResult`

|             | `await thunkResult`                              | `await thunkResult.unwrap()` |
| ----------- | ------------------------------------------------ | ---------------------------- |
| `fulfilled` | returns `{type: 'TYPE/fulfilled', payload, ...}` | returns `payload`            |
| `rejected`  | returns `{type: 'TYPE/rejected', error, ...}`    | throws `error`               |

#### [`createListenerMiddleware`](https://redux-toolkit.js.org/api/createListenerMiddleware)

for responding actions with asynchronous logic

```typescript
// listenerMiddleware.ts
export const listenerMiddleware = createListenerMiddleware({
  // will be injected into `ListenerApi.extra`
  extra,
  onError,
});

export const startAppListening =
  listenerMiddleware.startListening.withTypes<
    RootState,
    AppDispatch
  >();
export type AppStartListening = typeof startAppListening;

const unsubscribe = addSliceListeners(startAppListening);
// or
const unsubscribe = store.dispatch(
  addListener({
    // TYPE
    actionCreator: THUNK_CREATOR.fulfilled,
    // (Action, ListenerApi) => Promise?<void>
    effect: async (action, listenerApi) => {},
  }),
);

unsubscribe({ cancelActive: true });

// store.ts
const store = configureStore({
  middleware: (getDefault) =>
    getDefault().prepend(listenerMiddleware.middleware),
});

// slice.ts
export const addSliceListeners = (
  startAppListening: AppStartListening,
) => {
  startAppListening({
    actionCreator,
    effect,
  });
};
```

- `TYPE` exactly one of
  - `type: 'STATE_NAME/EVENT'`
  - `actionCreator`
  - [`matcher`](https://redux-toolkit.js.org/api/matching-utilities)
  - `predicate: (action, state, prevState) => boolean`
- `listenerMiddleware`
  - `.startListening()`
  - `.stopListening()` similar to `unsubscribe`
  - `.clearListeners()`
- `@reduxjs/toolkit`
  - `addListener()`
  - `removeListener()`
  - `clearAllListeners()`
- [`ListenerApi`](https://redux-toolkit.js.org/api/createListenerMiddleware#listener-api)

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
