import React from "react"
import { createRouter, createRoute, createRootRoute, useRouter } from "@tanstack/react-router"

import Index from "./pages/Index"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import PRDetails from "./pages/PRDetails";
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

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
})

const prRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pr/$prId",
  component: PRDetails,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  prRoute,
])



export const router = createRouter({
  routeTree,
})