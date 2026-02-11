import { Images } from "../../common/assets";

export const quotationData = {
  company: {
    name: "Syngrid Technologies",
    address: "Chennai, Tamil Nadu",
    phone: "+91 9876543210",
    email: "info@syngrid.com",
    logo: Images.smLogo, // replace with your image path
  },

  quotationInfo: {
    date: "04-Feb-2026",
    quotationNo: "QUO001",
  },

  quotationBy: {
    name: "Syngrid Technologies",
    place: "Chennai",
    district: "Chennai",
    phone: "+91 9876543210",
    gst: "33ABCDE1234F1Z5",
  },

  quotationTo: {
    name: "Client Name",
    place: "Coimbatore",
    district: "Coimbatore",
    phone: "+91 9123456789",
    gst: "33XYZDE5678G1Z9",
  },

  items: [
    { item: "Laptop", qty: 2, rate: 50000 },
    { item: "Monitor", qty: 1, rate: 15000 },
    { item: "Keyboard", qty: 2, rate: 1500 },
    { item: "Mouse", qty: 2, rate: 800 },
  ],

  charges: {
    shipping: 1000,
    gstPercent: 18,
  },

  footer: {
    logo: Images.fullLogo,
    website: "www.syngrid.com",
  },
};
