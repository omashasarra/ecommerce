import mongoose from "mongoose";
import { Service } from "../models/Service.js";
import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";

export const publicList = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminCreate = async (req, res) => {
  try {
    const { title, description, pricePerHour } = req.body;
    const image = req.file ? `/services/${req.file.filename}` : null;

    const service = await Service.create({
      title,
      description,
      image,
      pricePerHour,
      isActive: true,
    });

    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    if (!req.user) throw new Error("You must be logged in to book a service");

    const {
      serviceId,
      phone,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      startDate,
      endDate,
      startTime,
      endTime,
    } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found");

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    if (isNaN(startDateTime) || isNaN(endDateTime)) throw new Error("Invalid date or time");
    if (endDateTime <= startDateTime) throw new Error("Invalid booking time");

    const totalHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    const totalPrice = totalHours * service.pricePerHour;

    const booking = await Booking.create({
      user: req.user.sub, 
      service: service._id,
      clientName: req.user.name,
      clientEmail: req.user.email,
      phone,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      startDate,
      endDate,
      startTime,
      endTime,
      totalHours,
      totalPrice,
      status: "pending",
    });

    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.sub })
      .populate("service")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const adminListBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find()
    .populate("service")
    .populate("user")
    .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminUpdateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("service")
      .populate("user");
    if (!booking) throw new Error("Booking not found");
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const adminDeleteBooking = async (req, res) => {
  try {
    console.log("Deleting booking with ID:", req.params.id);
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      console.log("Booking not found in DB");
      return res.status(404).json({ error: "Booking not found" });
    }
    await booking.deleteOne();
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

