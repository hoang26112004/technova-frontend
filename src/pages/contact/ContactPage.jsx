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
      address: "Nhuận Tây - Đường An - TP.Hải Phòng",
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





        </div>
      </motion.div>
    </Layout>
  );
};

export default ContactPage;

