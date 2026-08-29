import { configureStore } from '@reduxjs/toolkit'
import musicData from '../features/musicdata'

export const store = configureStore({
    reducer: { musicdata: musicData },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch