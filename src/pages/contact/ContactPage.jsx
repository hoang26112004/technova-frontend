/* eslint-disable */
import React, { useMemo, useState } from "react";
import Layout from "@/components/commons/layout/Layout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { BsTelephoneFill } from "react-icons/bs";
import { RiMapPin2Fill } from "react-icons/ri";

const ContactPage = () => {
  const navigate = useNavigate();

  // You can later move these to env/config.
  const contact = useMemo(
    () => ({
      brand: "TechNova",
      email: "support@technova.com",
      phone: "+84 345 736 388 ",
      address: "266 Đội Cấn, Ba Đình, Hà Nội",
      mapEmbedSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9168302083826!2d105.81122397484918!3d21.036013580615144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab128b832837%3A0x277dc2c7fae28e1!2zMjY2IFAuIMSQ4buZaSBD4bqlbiwgTGnhu4V1IEdpYWksIEJhIMSQw6xuaCwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1744481168247!5m2!1svi!2s",
    }),
    []
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = `[${contact.brand}] Liên hệ từ ${form.name || "Khách hàng"}`;
    const body = [
      `Họ tên: ${form.name}`,
      `Email: ${form.email}`,
      `Điện thoại: ${form.phone}`,
      "",
      form.message,
    ].join("\n");

    const mailto = `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="pt-[20px] flex justify-center"
      >
        <div className="container w-[84%]">
          <div className="flex items-center gap-3 mb-8">
            <span
              onClick={() => navigate("/")}
              className="cursor-pointer hover:text-[#ff6347] duration-200"
            >
              Trang chủ
            </span>
            <FaChevronRight size={12} className="inline-block" />
            <p className="font-bold text-[#ff6347]">Liên hệ</p>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold leading-loose">
              Thông tin liên hệ
            </h2>
            <p className="text-gray-500">
              {contact.brand} luôn sẵn sàng hỗ trợ bạn trong quá trình mua sắm.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="h-[200px] flex justify-center items-center rounded-2xl bg-gray-100">
              <div className="text-center flex justify-center items-center flex-col gap-2">
                <RiMapPin2Fill color="#FF6347" size={56} className="inline-block" />
                <h3 className="font-bold">Địa chỉ</h3>
                <span className="text-gray-600">{contact.address}</span>
              </div>
            </div>
            <div className="h-[200px] flex justify-center items-center rounded-2xl bg-gray-100">
              <div className="text-center flex justify-center items-center flex-col gap-2">
                <IoMdMail color="#FF6347" size={56} className="inline-block" />
                <h3 className="font-bold">Email</h3>
                <span className="text-gray-600">{contact.email}</span>
              </div>
            </div>
            <div className="h-[200px] flex justify-center items-center rounded-2xl bg-gray-100">
              <div className="text-center flex justify-center items-center flex-col gap-2">
                <BsTelephoneFill color="#FF6347" size={50} className="inline-block" />
                <h3 className="font-bold">Hotline</h3>
                <span className="text-gray-600">{contact.phone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div>
              <iframe
                src={contact.mapEmbedSrc}
                width="100%"
                height="100%"
                className="rounded-md border border-gray-300 min-h-[340px]"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ"
              />
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <input
                type="text"
                required
                placeholder="Họ và tên"
                value={form.name}
                onChange={onChange("name")}
                className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-md focus:ring-0 focus:outline-none placeholder-gray-400"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={onChange("email")}
                className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-md focus:ring-0 focus:outline-none placeholder-gray-400"
              />
              <input
                type="tel"
                required
                placeholder="Điện thoại"
                value={form.phone}
                onChange={onChange("phone")}
                className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-md focus:ring-0 focus:outline-none placeholder-gray-400"
              />
              <textarea
                rows={6}
                required
                placeholder="Nội dung"
                value={form.message}
                onChange={onChange("message")}
                className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-md focus:ring-0 focus:outline-none placeholder-gray-400"
              />
              <div>
                <button
                  type="submit"
                  className="px-6 py-3 cursor-pointer text-white bg-[#FF6347] rounded-md hover:bg-white hover:text-[#FF6347] hover:border-[#ff6347] border border-transparent hover:border duration-200"
                >
                  Gửi thông tin
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Form này sẽ mở ứng dụng email của bạn để gửi tới {contact.email}.
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default ContactPage;

