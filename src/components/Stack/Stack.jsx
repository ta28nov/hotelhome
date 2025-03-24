import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Stack.css"; // Import file CSS từ cùng thư mục

// Component ImageModal hiển thị ảnh chi tiết với các mũi tên điều hướng
function ImageModal({ image, onClose, onPrev, onNext, hasPrev, hasNext }) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Nút mũi tên trái */}
          {hasPrev && (
            <button
              className="modal-arrow left"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
            >
              &#x276E;
            </button>
          )}
          <motion.img
            src={image}
            alt="Enlarged"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="modal-image"
          />
          {/* Nút mũi tên phải */}
          {hasNext && (
            <button
              className="modal-arrow right"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              &#x276F;
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Component CardRotate với hiệu ứng xoay (click mở modal)
function CardRotate({ children, customVariants, customIndex, onClick }) {
  return (
    <motion.div
      className="card-rotate"
      variants={customVariants}
      custom={customIndex}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export default function Stack({
  randomRotation = true,
  cardDimensions = { width: "50vh", height: "50vh" }, // Kích thước card
  cardsData = [],
  animationConfig = { stiffness: 260, damping: 20 },
}) {
  // Danh sách ảnh mặc định (56 ảnh)
  const defaultCardsData = [
    // Standard Room (8 ảnh)
    { id: 1, img: require("../../assets/images/StandardRoom1.jpg") },
    { id: 2, img: require("../../assets/images/StandardRoom2.jpg") },
    { id: 3, img: require("../../assets/images/StandardRoom3.jpg") },
    { id: 4, img: require("../../assets/images/StandardRoom4.jpg") },
    { id: 5, img: require("../../assets/images/StandardRoom5.jpg") },
    { id: 6, img: require("../../assets/images/StandardRoom6.jpg") },
    { id: 7, img: require("../../assets/images/StandardRoom7.jpg") },
    { id: 8, img: require("../../assets/images/StandardRoom8.jpg") },
    // Superior Room (8 ảnh)
    { id: 9, img: require("../../assets/images/SuperiorRoom1.jpg") },
    { id: 10, img: require("../../assets/images/SuperiorRoom2.jpg") },
    { id: 11, img: require("../../assets/images/SuperiorRoom3.jpg") },
    { id: 12, img: require("../../assets/images/SuperiorRoom4.jpg") },
    { id: 13, img: require("../../assets/images/SuperiorRoom5.jpg") },
    { id: 14, img: require("../../assets/images/SuperiorRoom6.jpg") },
    { id: 15, img: require("../../assets/images/SuperiorRoom7.jpg") },
    { id: 16, img: require("../../assets/images/SuperiorRoom8.jpg") },
    // Deluxe Room (8 ảnh)
    { id: 17, img: require("../../assets/images/DeluxeRoom1.jpg") },
    { id: 18, img: require("../../assets/images/DeluxeRoom2.jpg") },
    { id: 19, img: require("../../assets/images/DeluxeRoom3.jpg") },
    { id: 20, img: require("../../assets/images/DeluxeRoom4.jpg") },
    { id: 21, img: require("../../assets/images/DeluxeRoom5.jpg") },
    { id: 22, img: require("../../assets/images/DeluxeRoom6.jpg") },
    { id: 23, img: require("../../assets/images/DeluxeRoom7.jpg") },
    { id: 24, img: require("../../assets/images/DeluxeRoom8.jpg") },
    // Suite Room (8 ảnh)
    { id: 25, img: require("../../assets/images/SuiteRoom1.jpg") },
    { id: 26, img: require("../../assets/images/SuiteRoom2.jpg") },
    { id: 27, img: require("../../assets/images/SuiteRoom3.jpg") },
    { id: 28, img: require("../../assets/images/SuiteRoom4.jpg") },
    { id: 29, img: require("../../assets/images/SuiteRoom5.jpg") },
    { id: 30, img: require("../../assets/images/SuiteRoom6.jpg") },
    { id: 31, img: require("../../assets/images/SuiteRoom7.jpg") },
    { id: 32, img: require("../../assets/images/SuiteRoom8.jpg") },
    // Single Room (8 ảnh)
    { id: 33, img: require("../../assets/images/SingleRoom1.jpg") },
    { id: 34, img: require("../../assets/images/SingleRoom2.jpg") },
    { id: 35, img: require("../../assets/images/SingleRoom3.jpg") },
    { id: 36, img: require("../../assets/images/SingleRoom4.jpg") },
    { id: 37, img: require("../../assets/images/SingleRoom5.jpg") },
    { id: 38, img: require("../../assets/images/SingleRoom6.jpg") },
    { id: 39, img: require("../../assets/images/SingleRoom7.jpg") },
    { id: 40, img: require("../../assets/images/SingleRoom8.jpg") },
    // Family Room (8 ảnh)
    { id: 41, img: require("../../assets/images/FamilyRoom1.jpg") },
    { id: 42, img: require("../../assets/images/FamilyRoom2.jpg") },
    { id: 43, img: require("../../assets/images/FamilyRoom3.jpg") },
    { id: 44, img: require("../../assets/images/FamilyRoom4.jpg") },
    { id: 45, img: require("../../assets/images/FamilyRoom5.jpg") },
    { id: 46, img: require("../../assets/images/FamilyRoom6.jpg") },
    { id: 47, img: require("../../assets/images/FamilyRoom7.jpg") },
    { id: 48, img: require("../../assets/images/FamilyRoom8.jpg") },
    // Executive Room (8 ảnh)
    { id: 49, img: require("../../assets/images/ExecutiveRoom1.jpg") },
    { id: 50, img: require("../../assets/images/ExecutiveRoom2.jpg") },
    { id: 51, img: require("../../assets/images/ExecutiveRoom3.jpg") },
    { id: 52, img: require("../../assets/images/ExecutiveRoom4.jpg") },
    { id: 53, img: require("../../assets/images/ExecutiveRoom5.jpg") },
    { id: 54, img: require("../../assets/images/ExecutiveRoom6.jpg") },
    { id: 55, img: require("../../assets/images/ExecutiveRoom7.jpg") },
    { id: 56, img: require("../../assets/images/ExecutiveRoom8.jpg") },
  ];

  // Nếu truyền cardsData từ props thì dùng, còn không dùng defaultCardsData
  const [cards] = useState(cardsData.length ? cardsData : defaultCardsData);
  // selectedIndex để mở modal và theo dõi ảnh đang được xem
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Variants của container (stagger effect)
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  // Variants cho từng card
  const cardVariants = {
    hidden: { opacity: 0, y: -50, rotate: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotate: randomRotation ? Math.random() * 10 - 5 : 0,
      transition: {
        type: "spring",
        stiffness: animationConfig.stiffness,
        damping: animationConfig.damping,
        delay: i * 0.15,
      },
    }),
  };

  // Hàm mở modal: lưu lại chỉ số của ảnh được chọn
  const openModal = (index) => {
    setSelectedIndex(index);
  };

  // Hàm điều hướng trong modal
  const showPrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const showNext = () => {
    if (selectedIndex < cards.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <>
      <motion.div
        className="stack-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: cardDimensions.width,
          height: cardDimensions.height,
          perspective: 600,
          position: "relative",
        }}
      >
        {cards.map((card, index) => (
          <CardRotate
            key={card.id}
            customVariants={cardVariants}
            customIndex={index}
            onClick={() => openModal(index)}
          >
            <motion.div
              className="card"
              variants={cardVariants}
              custom={index}
              style={{ width: "100%", height: "100%" }}
            >
              <img
                src={card.img}
                alt={`card-${card.id}`}
                className="card-image"
              />
            </motion.div>
          </CardRotate>
        ))}
      </motion.div>
      <ImageModal
        image={selectedIndex !== null ? cards[selectedIndex].img : null}
        onClose={() => setSelectedIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < cards.length - 1}
      />
    </>
  );
}
