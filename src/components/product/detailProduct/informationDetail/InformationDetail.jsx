/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { FaStar, FaRegStar, FaRegStarHalfStroke } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import reviewApi from "@/utils/api/reviewApi";

import "./InformationDetail.scss";

const InformationDetail = ({ product, onRefreshReviews, initialMenu, autoOpenWrite }) => {
  const navigate = useNavigate();
  const [typeMenu, setTypeMenu] = useState("info");
  const [rate, setRate] = useState(0);
  const [comments, setComments] = useState(product?.comments || []);
  const [showWrite, setShowWrite] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const didAutoOpenRef = useRef(false);

  useEffect(() => {
    setComments(product?.comments || []);
  }, [product?.comments]);

  useEffect(() => {
    if (!initialMenu) return;
    setTypeMenu(initialMenu);
  }, [initialMenu]);

  useEffect(() => {
    if (!autoOpenWrite) return;
    if (!product?.id) return;
    if (didAutoOpenRef.current) return;
    didAutoOpenRef.current = true;
    setTypeMenu("comment");
    setTimeout(() => openWrite(), 0);
  }, [autoOpenWrite, product?.id]);

  useEffect(() => {
    if (!comments.length) {
      setRate(0);
      return;
    }
    const sumRate = comments.reduce((sum, item) => sum + (item.rating || 0), 0);
    setRate(sumRate / comments.length);
  }, [comments]);

  useEffect(() => {
    if (!showWrite) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowWrite(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showWrite]);

  const openWrite = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để đánh giá sản phẩm.");
      navigate("/auth");
      return;
    }
    setSubmitError("");
    setDraftRating(5);
    setHoverRating(0);
    setDraftComment("");
    setShowWrite(true);
  };

  const submitReview = async () => {
    if (!product?.id) return;
    const rating = Number(draftRating || 0);
    const comment = (draftComment || "").trim();
    setSubmitError("");

    if (!rating || rating < 1 || rating > 5) {
      setSubmitError("Vui lòng chọn số sao (1-5).");
      return;
    }
    if (!comment) {
      setSubmitError("Vui lòng nhập nhận xét.");
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.create({ productId: product.id, rating, comment });

      if (typeof onRefreshReviews === "function") {
        await onRefreshReviews();
      } else {
        const res = await reviewApi.getByProduct(product.id);
        const page = res?.data?.data;
        const items = page?.content || [];
        setComments(
          items.map((r) => ({
            id: r?.id,
            name: r?.userName || "User",
            rating: Number(r?.rating || 0),
            comment: r?.comment || "",
            avatar: "/vite.svg",
          }))
        );
      }

      setShowWrite(false);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setSubmitError("Bạn cần đăng nhập để đánh giá sản phẩm.");
      } else {
        const message =
          err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          "Gửi đánh giá thất bại. Vui lòng thử lại.";
        if (String(message).includes("already reviewed")) {
          setSubmitError("Bạn đã đánh giá sản phẩm này rồi.");
        } else if (String(message).includes("only review products")) {
          setSubmitError("Chỉ có thể đánh giá sản phẩm đã mua và đã nhận hàng.");
        } else {
          setSubmitError(String(message));
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviews = Array.isArray(comments) ? comments.length : 0;
  const safeRate = totalReviews ? rate : 0;
  const byStar = [0, 0, 0, 0, 0, 0]; // index 1..5
  (comments || []).forEach((c) => {
    const r = Math.max(1, Math.min(5, Math.round(Number(c?.rating || 0))));
    byStar[r] += 1;
  });

  const renderStars = (value) => {
    const v = Number(value || 0);
    const full = Math.floor(v);
    const hasHalf = v - full >= 0.5 && full < 5;
    const empty = Math.max(0, 5 - full - (hasHalf ? 1 : 0));
    return (
      <span className="review__stars" aria-hidden="true">
        {Array.from({ length: full }, (_, i) => (
          <FaStar key={`f-${i}`} />
        ))}
        {hasHalf ? <FaRegStarHalfStroke key="h" /> : null}
        {Array.from({ length: empty }, (_, i) => (
          <FaRegStar key={`e-${i}`} />
        ))}
      </span>
    );
  };

  const initialsOf = (name) => {
    const s = String(name || "").trim();
    if (!s) return "?";
    const parts = s.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]).join("").toUpperCase();
  };

  return (
    <div className="infomation">
      <div data-aos="fade-up" className="infomation-menu">
        <ul className="infomation-menu__list">
          <li
            className={`${typeMenu === "info" ? "active" : ""}`}
            onClick={() => setTypeMenu("info")}
          >
            Thông tin sản phẩm
          </li>
          <li
            className={`${typeMenu === "exchangePolicy" ? "active" : ""}`}
            onClick={() => setTypeMenu("exchangePolicy")}
          >
            Chính sách đổi trả
          </li>
          <li
            className={`${typeMenu === "comment" ? "active" : ""}`}
            onClick={() => setTypeMenu("comment")}
          >
            Đánh giá sản phẩm
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
      {typeMenu === "comment" ? (
        <div data-aos="fade-up" className="review">
          <div className="review__grid">
            <div className="review__card review__card--summary">
              <div className="review__summaryTop">
                <div className="review__score">
                  <div className="review__scoreValue">{safeRate.toFixed(1)}</div>
                  <div className="review__scoreStars">{renderStars(safeRate)}</div>
                  <div className="review__scoreMeta">{totalReviews} đánh giá</div>
                </div>
                <button type="button" className="review__cta" onClick={openWrite}>
                  Viết đánh giá
                </button>
              </div>

              <div className="review__bars" aria-label="Phân bố đánh giá theo sao">
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = byStar[s] || 0;
                  const pct = totalReviews ? (count / totalReviews) * 100 : 0;
                  return (
                    <div className="review__bar" key={s}>
                      <div className="review__barLabel">
                        <span className="review__barStar">{s}</span>
                        <FaStar className="review__barStarIcon" />
                      </div>
                      <div className="review__barTrack" role="img" aria-label={`${s} sao: ${count}`}>
                        <div className="review__barFill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="review__barCount">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="review__card review__card--list">
              <div className="review__listHeader">
                <div className="review__listTitle">Nhận xét</div>
                <div className="review__listMeta">{totalReviews}</div>
              </div>

              {totalReviews === 0 ? (
                <div className="review__empty">
                  Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm.
                </div>
              ) : (
                <div className="review__list">
                  {comments.map((comment) => {
                    const isPlaceholderAvatar =
                      !comment?.avatar || String(comment.avatar) === "/vite.svg";
                    return (
                      <div className="review__item" key={comment.id}>
                        {isPlaceholderAvatar ? (
                          <div className="review__avatar" aria-hidden="true">
                            {initialsOf(comment.name)}
                          </div>
                        ) : (
                          <img
                            className="review__avatarImg"
                            src={comment.avatar}
                            alt={comment.name}
                          />
                        )}
                        <div className="review__body">
                          <div className="review__topRow">
                            <div className="review__name">{comment.name}</div>
                            <div className="review__rating" aria-label={`Đánh giá ${comment.rating} sao`}>
                              {Array.from({ length: comment.rating }, (_, i) => (
                                <FaStar key={`a-${comment.id}-${i}`} />
                              ))}
                              {Array.from({ length: 5 - comment.rating }, (_, i) => (
                                <FaRegStar key={`i-${comment.id}-${i}`} />
                              ))}
                            </div>
                          </div>
                          <div className="review__content">{comment.comment}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {showWrite ? (
            <div
              className="reviewModal"
              role="dialog"
              aria-modal="true"
              aria-label="Viết đánh giá"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setShowWrite(false);
              }}
            >
              <div className="reviewModal__card" role="document">
                <div className="reviewModal__header">
                  <div className="reviewModal__title">Viết đánh giá</div>
                  <button
                    type="button"
                    className="reviewModal__close"
                    onClick={() => setShowWrite(false)}
                    aria-label="Đóng"
                  >
                    &times;
                  </button>
                </div>

                <div className="comment__form">
                  <div className="comment__form-title">Đánh giá của bạn</div>
                  <div className="comment__form-stars" aria-label="Chọn số sao">
                    {Array.from({ length: 5 }, (_, idx) => {
                      const v = idx + 1;
                      const active = (hoverRating || draftRating) >= v;
                      return (
                        <span
                          key={v}
                          className={`comment__form-star ${active ? "is-active" : ""}`}
                          onMouseEnter={() => setHoverRating(v)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setDraftRating(v)}
                          role="button"
                          tabIndex={0}
                        >
                          {active ? <FaStar /> : <FaRegStar />}
                        </span>
                      );
                    })}
                    <span className="comment__form-star-value">{draftRating}/5</span>
                  </div>

                  <textarea
                    className="comment__form-text"
                    rows={4}
                    value={draftComment}
                    onChange={(e) => setDraftComment(e.target.value)}
                    placeholder="Nhập nhận xét..."
                  />

                  {submitError ? (
                    <div className="comment__form-error">{submitError}</div>
                  ) : null}

                  <div className="comment__form-actions">
                    <button
                      type="button"
                      className="comment__form-btn comment__form-btn--ghost"
                      onClick={() => setShowWrite(false)}
                      disabled={submitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="comment__form-btn comment__form-btn--primary"
                      onClick={submitReview}
                      disabled={submitting}
                    >
                      {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default InformationDetail;
