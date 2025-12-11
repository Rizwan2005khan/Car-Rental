import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [cars, setCars] = useState([]);

  // ----- Helper: Apply token to axios -----
  const applyToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // ----- Fetch logged-in user -----
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load user");
    }
  };

  // ----- Fetch all cars -----
  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/user/cars");
      data.success ? setCars(data.cars) : toast.error(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch cars");
    }
  };

  // ----- Logout -----
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    applyToken(null);
    toast.success("You have been logged out");
    navigate("/");
  };

  // ----- Load token on initial mount -----
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      applyToken(savedToken);
    }
    fetchCars(); // safe: public cars
  }, []);

  // ----- Whenever token changes -----
  useEffect(() => {
    if (token) {
      applyToken(token);
      fetchUser();
    }
  }, [token]);

  const value = {
    navigate,
    currency,
    axios,

    user,
    setUser,

    token,
    setToken,

    isOwner,
    setIsOwner,

    showLogin,
    setShowLogin,

    fetchUser,
    logout,

    cars,
    setCars,
    fetchCars,

    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
