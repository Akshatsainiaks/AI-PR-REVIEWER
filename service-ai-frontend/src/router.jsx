import React from "react"
import { createRouter, createRoute, createRootRoute, useRouter } from "@tanstack/react-router"

import Index from "./pages/Index"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"

function DefaultErrorComponent({ error, reset }) {
  const router = useRouter()

  return (
    <div>
      <h1>Error</h1>
      <p>{error?.message}</p>
      <button
        onClick={() => {
          router.invalidate()
          reset()
        }}
      >
        Retry
      </button>
    </div>
  )
}

const rootRoute = createRootRoute({
  errorComponent: DefaultErrorComponent,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: Signup,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  dashboardRoute,
])



export const router = createRouter({
  routeTree,
})