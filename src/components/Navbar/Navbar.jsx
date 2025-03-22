"use client"; // Component client-side

import React, { useState, useEffect, useRef, Children, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  VscHome,
  VscInfo,
  VscCalendar,
  VscMail,
  VscGraph,
  VscSignIn,
} from "react-icons/vsc";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import "./Navbar.css";

/* ============================================================
   COMPONENT SHINYTEXT
   - Code của ShinyText được gộp luôn ở đây để tạo hiệu ứng gradient cho văn bản nút "Đặt phòng".
   ============================================================ */
const ShinyText = ({ text, disabled = false, speed = 5, className = "" }) => {
  const animationDuration = `${speed}s`;
  return (
    <div
      className={`shiny-text ${disabled ? "disabled" : ""} ${className}`}
      style={{ animationDuration }}
    >
      {text}
    </div>
  );
};

/* ============================================================
   PHẦN DOCK (Navigation Bar)
   - Hiển thị các biểu tượng điều hướng với hiệu ứng phóng to khi hover.
   ============================================================ */

// Component DockItem: mỗi mục icon trong Dock
function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
    >
      {Children.map(children, (child) =>
        cloneElement(child, { isHovered })
      )}
    </motion.div>
  );
}

// Component DockLabel: hiển thị nhãn của mục khi hover
function DockLabel({ children, className = "", isHovered }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`dock-label ${className}`}
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Component DockIcon: hiển thị icon của mục
function DockIcon({ children, className = "" }) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

// Component Dock: tập hợp các mục điều hướng thành một thanh
function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 50,
  distance = 200,
  panelHeight = 60,
  dockHeight = 240,
  baseItemSize = 40,
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const maxHeight = panelHeight < dockHeight ? dockHeight : panelHeight;
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);
  return (
    <motion.div style={{ height, scrollbarWidth: "none" }} className="dock-outer">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   PHẦN HOTEL SEARCH BAR (Booking Bar)
   - Thanh đặt phòng dạng dài, hiển thị đầy đủ khi trang chưa cuộn xuống.
   - Bao gồm các trường: Số người, Số phòng, Loại phòng, Ngày nhận phòng, Ngày trả phòng, Ghi chú.
   - Nút "Đặt phòng" được hiển thị inline với hiệu ứng ShinyText.
   ============================================================ */
function HotelSearchBar() {
  const navigate = useNavigate();
  const [numPeople, setNumPeople] = useState(1);
  const [numRooms, setNumRooms] = useState(1);
  const [roomType, setRoomType] = useState("Standard Room");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleBooking = (e) => {
    e.preventDefault();
    navigate("/booking", {
      state: { numPeople, numRooms, roomType, checkInDate, checkOutDate, notes },
    });
  };

  return (
    <form className="hotel-search-bar" onSubmit={handleBooking}>
      <div className="search-field">
        <label>Số người</label>
        <input
          type="number"
          min="1"
          value={numPeople}
          onChange={(e) => setNumPeople(e.target.value)}
        />
      </div>
      <div className="search-field">
        <label>Số phòng</label>
        <input
          type="number"
          min="1"
          value={numRooms}
          onChange={(e) => setNumRooms(e.target.value)}
        />
      </div>
      <div className="search-field">
        <label>Loại phòng</label>
        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
          <option value="Standard Room">Standard Room</option>
          <option value="Deluxe Room">Deluxe Room</option>
          <option value="Suite">Suite</option>
          <option value="Family Room">Family Room</option>
          <option value="Executive Room">Executive Room</option>
        </select>
      </div>
      <div className="search-field">
        <label>Ngày nhận phòng</label>
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
        />
      </div>
      <div className="search-field">
        <label>Ngày trả phòng</label>
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
        />
      </div>
      <div className="search-field">
        <label>Ghi chú</label>
        <input
          type="text"
          placeholder="Nhập ghi chú..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <button type="submit" className="book-now-button">
        <ShinyText text="Đặt phòng" disabled={false} speed={3} className="book-now-text" />
      </button>
    </form>
  );
}

/* ============================================================
   COMPONENT NAVBAR
   - Tích hợp phần Dock (Navigation) và phần tìm kiếm (Booking Bar).
   - Khi cuộn trang vượt quá 200px, phần HotelSearchBar sẽ biến mất.
   - Navbar được cố định luôn hiển thị.
   ============================================================ */
export default function Navbar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsCollapsed(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const items = [
    { icon: <VscHome size={18} />, label: "Home", onClick: () => navigate("/") },
    { icon: <VscInfo size={18} />, label: "About", onClick: () => navigate("/about") },
    { icon: <VscCalendar size={18} />, label: "Booking", onClick: () => navigate("/booking") },
    { icon: <VscMail size={18} />, label: "Contact", onClick: () => navigate("/contact") },
    { icon: <VscGraph size={18} />, label: "Dashboard", onClick: () => navigate("/dashboard") },
    { icon: <VscSignIn size={18} />, label: "Login", onClick: () => navigate("/login") },
  ];
  return (
    <nav className="navbar">
      <Dock items={items} />
      {!isCollapsed && <HotelSearchBar />}
    </nav>
  );
}
