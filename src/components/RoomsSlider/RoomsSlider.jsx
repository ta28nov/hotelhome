"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import Stack from "../Stack/Stack";
import "./RoomsSlider.css";

const ONE_SECOND = 1000;
const AUTO_DELAY = ONE_SECOND * 8; // tự động chuyển sau 8 giây
const DRAG_BUFFER = 50;
const SPRING_OPTIONS = {
  type: "spring",
  mass: 3,
  stiffness: 400,
  damping: 50,
};

// Với 7 ảnh, mỗi card chiếm 32vw (30vw + 2vw gap)
const CARD_OFFSET_VW = 32;

const roomsData = [
  {
    id: 1,
    img: require("../../assets/images/StandardRoom.jpg"),
    title: "Standard Room",
    description: "A comfortable standard room.",
    details: [
      require("../../assets/images/StandardRoom1.jpg"),
      require("../../assets/images/StandardRoom2.jpg"),
      require("../../assets/images/StandardRoom3.jpg"),
      require("../../assets/images/StandardRoom4.jpg"),
      require("../../assets/images/StandardRoom5.jpg"),
      require("../../assets/images/StandardRoom6.jpg"),
      require("../../assets/images/StandardRoom7.jpg"),
      require("../../assets/images/StandardRoom8.jpg"),
    ],
  },
  {
    id: 2,
    img: require("../../assets/images/SuperiorRoom.jpg"),
    title: "Superior Room",
    description: "A superior room with enhanced amenities.",
    details: [
      require("../../assets/images/SuperiorRoom1.jpg"),
      require("../../assets/images/SuperiorRoom2.jpg"),
      require("../../assets/images/SuperiorRoom3.jpg"),
      require("../../assets/images/SuperiorRoom4.jpg"),
      require("../../assets/images/SuperiorRoom5.jpg"),
      require("../../assets/images/SuperiorRoom6.jpg"),
      require("../../assets/images/SuperiorRoom7.jpg"),
      require("../../assets/images/SuperiorRoom8.jpg"),
    ],
  },
  {
    id: 3,
    img: require("../../assets/images/DeluxeRoom.jpg"),
    title: "Deluxe Room",
    description: "A deluxe room offering luxury and comfort.",
    details: [
      require("../../assets/images/DeluxeRoom1.jpg"),
      require("../../assets/images/DeluxeRoom2.jpg"),
      require("../../assets/images/DeluxeRoom3.jpg"),
      require("../../assets/images/DeluxeRoom4.jpg"),
      require("../../assets/images/DeluxeRoom5.jpg"),
      require("../../assets/images/DeluxeRoom6.jpg"),
      require("../../assets/images/DeluxeRoom7.jpg"),
      require("../../assets/images/DeluxeRoom8.jpg"),
    ],
  },
  {
    id: 4,
    img: require("../../assets/images/SuiteRoom.jpg"),
    title: "Suite Room",
    description: "A spacious suite with premium facilities.",
    details: [
      require("../../assets/images/SuiteRoom1.jpg"),
      require("../../assets/images/SuiteRoom2.jpg"),
      require("../../assets/images/SuiteRoom3.jpg"),
      require("../../assets/images/SuiteRoom4.jpg"),
      require("../../assets/images/SuiteRoom5.jpg"),
      require("../../assets/images/SuiteRoom6.jpg"),
      require("../../assets/images/SuiteRoom7.jpg"),
      require("../../assets/images/SuiteRoom8.jpg"),
    ],
  },
  {
    id: 5,
    img: require("../../assets/images/SingleRoom.jpg"),
    title: "Single Room",
    description: "Ideal for solo travelers.",
    details: [
      require("../../assets/images/SingleRoom1.jpg"),
      require("../../assets/images/SingleRoom2.jpg"),
      require("../../assets/images/SingleRoom3.jpg"),
      require("../../assets/images/SingleRoom4.jpg"),
      require("../../assets/images/SingleRoom5.jpg"),
      require("../../assets/images/SingleRoom6.jpg"),
      require("../../assets/images/SingleRoom7.jpg"),
      require("../../assets/images/SingleRoom8.jpg"),
    ],
  },
  {
    id: 6,
    img: require("../../assets/images/FamilyRoom.jpg"),
    title: "Family Room",
    description: "Spacious room designed for families.",
    details: [
      require("../../assets/images/FamilyRoom1.jpg"),
      require("../../assets/images/FamilyRoom2.jpg"),
      require("../../assets/images/FamilyRoom3.jpg"),
      require("../../assets/images/FamilyRoom4.jpg"),
      require("../../assets/images/FamilyRoom5.jpg"),
      require("../../assets/images/FamilyRoom6.jpg"),
      require("../../assets/images/FamilyRoom7.jpg"),
      require("../../assets/images/FamilyRoom8.jpg"),
    ],
  },
  {
    id: 7,
    img: require("../../assets/images/ExecutiveRoom.jpg"),
    title: "Executive Room",
    description: "Premium room for executives.",
    details: [
      require("../../assets/images/ExecutiveRoom1.jpg"),
      require("../../assets/images/ExecutiveRoom2.jpg"),
      require("../../assets/images/ExecutiveRoom3.jpg"),
      require("../../assets/images/ExecutiveRoom4.jpg"),
      require("../../assets/images/ExecutiveRoom5.jpg"),
      require("../../assets/images/ExecutiveRoom6.jpg"),
      require("../../assets/images/ExecutiveRoom7.jpg"),
      require("../../assets/images/ExecutiveRoom8.jpg"),
    ],
  },
];

// Modal hiển thị chi tiết phòng
const RoomModal = ({ room, onClose }) => {
  return (
    <motion.div 
      className="room-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div 
        className="room-modal-content"
        initial={{ y: "-100vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100vh", opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img 
          src={room.img} 
          alt={room.title} 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        <h2>{room.title}</h2>
        <p>{room.description}</p>
        <div className="room-details-stack">
          <Stack
            randomRotation={true}
            sensitivity={100}
            cardDimensions={{ width: 300, height: 208 }}
            cardsData={room.details.map((imgPath, index) => ({
              id: index + 1,
              img: imgPath,
            }))}
            animationConfig={{ stiffness: 260, damping: 20 }}
          />
        </div>
        <button onClick={onClose}>Close</button>
      </motion.div>
    </motion.div>
  );
};

const RoomsSlider = () => {
  // roomIndex theo dõi phòng hiện tại
  const [roomIndex, setRoomIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const dragX = useMotionValue(0);

  // Auto slide sau AUTO_DELAY nếu không có thao tác kéo
  useEffect(() => {
    const intervalRef = setInterval(() => {
      if (dragX.get() === 0) {
        setRoomIndex((prev) => (prev === roomsData.length - 1 ? 0 : prev + 1));
      }
    }, AUTO_DELAY);
    return () => clearInterval(intervalRef);
  }, [dragX]);

  const onDragEnd = () => {
    const x = dragX.get();
    if (x <= -DRAG_BUFFER && roomIndex < roomsData.length - 1) {
      setRoomIndex(roomIndex + 1);
    } else if (x >= DRAG_BUFFER && roomIndex > 0) {
      setRoomIndex(roomIndex - 1);
    }
    dragX.set(0);
  };

  return (
    <section className="rooms-slider-section">
      {/* Slogan tĩnh */}
      <div className="slogan-container">
        <div className="slogan-line-1">Luxury<br />Awaits</div>
        <div className="slogan-line-2">Your<br />Escape</div>
      </div>

      {/* Carousel Rooms Slider */}
      <motion.div
        className="rooms-slider"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x: dragX }}
        animate={{ translateX: `-${roomIndex * CARD_OFFSET_VW}vw` }}
        transition={SPRING_OPTIONS}
        onDragEnd={onDragEnd}
      >
        {roomsData.map((room) => (
          <div
            key={room.id}
            className={`room-card ${room.id % 2 === 0 ? "portrait" : "landscape"}`}
            onClick={() => setSelectedRoom(room)}
          >
            <img src={room.img} alt={room.title} className="room-image" />
            <span className="room-label">{room.title}</span>
          </div>
        ))}
      </motion.div>

      {/* Dots điều hướng */}
      <div className="dots-container">
        {roomsData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setRoomIndex(idx)}
            className={`dot ${idx === roomIndex ? "active" : ""}`}
          />
        ))}
      </div>

      {/* Gradient edges */}
      <div className="gradient-edge left"></div>
      <div className="gradient-edge right"></div>

      {/* Modal hiển thị chi tiết phòng */}
      <AnimatePresence>
        {selectedRoom && (
          <RoomModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default RoomsSlider;
