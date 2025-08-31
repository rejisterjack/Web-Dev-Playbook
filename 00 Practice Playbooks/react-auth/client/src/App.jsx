import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Auth, NavBar, ProtectedRoute } from './components'
import { AuthProvider } from './context/AuthContext'
import {
  Accordion,
  AutoSuggestion,
  BreadCrumb,
  Carousel,
  DragAndDrop,
  FormValidations,
  Home,
  InfiniteScroll,
  SearchBar,
  Toast,
  Pagination,
} from './pages'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path='/login' element={<Auth />} />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path='/draganddrop'
            element={
              <ProtectedRoute>
                <DragAndDrop />
              </ProtectedRoute>
            }
          />
          <Route
            path='/accordion'
            element={
              <ProtectedRoute>
                <Accordion />
              </ProtectedRoute>
            }
          />
          <Route
            path='/toast'
            element={
              <ProtectedRoute>
                <Toast />
              </ProtectedRoute>
            }
          />
          <Route
            path='/carousel'
            element={
              <ProtectedRoute>
                <Carousel />
              </ProtectedRoute>
            }
          />
          <Route
            path='/infinitescroll'
            element={
              <ProtectedRoute>
                <InfiniteScroll />
              </ProtectedRoute>
            }
          />
          <Route
            path='/autosuggestion'
            element={
              <ProtectedRoute>
                <AutoSuggestion />
              </ProtectedRoute>
            }
          />
          <Route
            path='/breadcrumb'
            element={
              <ProtectedRoute>
                <BreadCrumb />
              </ProtectedRoute>
            }
          />
          <Route
            path='/formvalidations'
            element={
              <ProtectedRoute>
                <FormValidations />
              </ProtectedRoute>
            }
          />
          <Route
            path='/searchbar'
            element={
              <ProtectedRoute>
                <SearchBar />
              </ProtectedRoute>
            }
          />
          <Route
            path='/pagination'
            element={
              <ProtectedRoute>
                <Pagination />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
