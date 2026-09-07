import {apiConnector} from "../apiConnecter"
import { endpoints } from "../apis"
import { toast } from "react-hot-toast"


const {
    FETCH_USERNAME_API,
    LOGIN_API
} = endpoints

export function fetchUsername() {
  return async () => {
    try {
      const response = await apiConnector("GET", FETCH_USERNAME_API)
      //console.log("FETCH USERNAME API RESPONSE............", response)
      return response
    } catch (error) {
      console.log("FETCH USERNAME API ERROR............", error)
      throw error
    }
  }
}

export function login(userName, password, navigate) {
  return async (dispatch) => {
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        username: userName,
        password,
      })

      // console.log("LOGIN API RESPONSE............", response)

      // If backend explicitly sends "Invalid credentials"
      if (
        response?.data?.message &&
        response.data.message.toLowerCase().includes("invalid credentials")
      ) {
        toast.error("Incorrect password")
        return
      }

      // If status code is not success
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`API Error: ${response.status}`)
      }

      // Extract user from API response
      const user = response.data.user

      // Save user in localStorage (acts as session)
      localStorage.setItem("user", JSON.stringify(user))

      toast.success("Logged in successfully")
      navigate("/home")
    } catch (error) {
      // console.log("LOGIN API ERROR............", error)

      // Handle Invalid credentials from error response
      if (
        error?.response?.data?.message &&
        error.response.data.message.toLowerCase().includes("invalid credentials")
      ) {
        toast.error("Incorrect password")
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    }
  }
}
