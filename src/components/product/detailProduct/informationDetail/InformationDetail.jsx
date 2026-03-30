/* eslint-disable */
import React, { useEffect, useState } from "react";
import { FaStar, FaRegStar, FaRegStarHalfStroke } from "react-icons/fa6";

import "./InformationDetail.scss";

const InformationDetail = ({ product }) => {
  const [typeMenu, setTypeMenu] = useState("info");
  const [rate, setRate] = useState(0);
  const comments = product?.comments || [];

  useEffect(() => {
    if (!comments.length) {
      setRate(0);
      return;
    }
    const sumRate = comments.reduce((sum, item) => sum + (item.rating || 0), 0);
    setRate(sumRate / comments.length);
  }, [comments]);

  return (
    <div className="infomation">
      <div data-aos="fade-up" className="infomation-menu">
        <ul className="infomation-menu__list">
          <li
            className={`${typeMenu === "info" ? "active" : ""}`}
            onClick={() => setTypeMenu("info")}
          >
            Thong tin san pham
          </li>
          <li
            className={`${typeMenu === "exchangePolicy" ? "active" : ""}`}
            onClick={() => setTypeMenu("exchangePolicy")}
          >
            Chinh sach doi tra
          </li>
          <li
            className={`${typeMenu === "comment" ? "active" : ""}`}
            onClick={() => setTypeMenu("comment")}
          >
            Danh gia san pham
          </li>
        </ul>
      </div>
      {typeMenu === "info" && (
        <div data-aos="fade-up" className="info">
          {product.description}
        </div>
      )}
      {typeMenu === "exchangePolicy" && (
        <div data-aos="fade-up" className="exchangePolicy">
          {product.exchangePolicy}
        </div>
      )}
      {typeMenu === "comment" &&
        (comments.length === 0 ? (
          <div data-aos="fade-up" className="comment__no">
            Chua co danh gia nao
          </div>
        ) : (
          <div data-aos="fade-up" className="comment__have">
            <h1>{product.name}</h1>
            <div className="comment__have__rate">
              <div className="comment__have__rate__star">
                <span className="comment__have__rate-number">
                  {rate.toFixed(1)}
                </span>
                <span>
                  {Array.from({ length: Math.floor(rate) }, (_, i) => (
                    <FaStar key={i} />
                  ))}
                  {rate % 1 !== 0 && <FaRegStarHalfStroke />}
                  {Array.from({ length: 5 - Math.ceil(rate) }, (_, i) => (
                    <FaRegStar key={i} />
                  ))}
                </span>
              </div>
              <div className="comment__have__rate-count">
                <span>{comments.length}</span> Danh gia
              </div>
            </div>
            <div className="comment__have__list">
              {comments.map((comment) => (
                <div className="comment__have__item" key={comment.id}>
                  <img src={comment.avatar} alt={comment.name} />
                  <div className="comment__have__item-content">
                    <p className="name">{comment.name}</p>
                    <div className="rating">
                      {Array.from({ length: comment.rating }, (_, i) => (
                        <FaStar key={i} />
                      ))}
                      {Array.from({ length: 5 - comment.rating }, (_, i) => (
                        <FaRegStar key={i} />
                      ))}
                    </div>
                    <p className="content">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="comment__have__write">
              <button>Viet danh gia</button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default InformationDetail;
