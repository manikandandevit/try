import { Download, Share2 } from "lucide-react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

const ShareButton = () => {
  return (
    <div className="relative group inline-block w-32 h-10">

      <div
        className="relative w-full h-full rounded-full bg-primary text-white overflow-hidden"
        // style={{
        //   boxShadow: `
        //     -2px -2px 2px 0px #B8CCE0,
        //     -1px -1px 0px 0px #FFFFFF,
        //     inset -2px -2px 2px 0px #B8CCE0,
        //     inset -1px -1px 0px 0px #FFFFFF
        //   `
        // }}
      >

        {/* Sliding Container */}
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:-translate-y-full">

          {/* Share Button (Top Layer) */}
          <div className="flex items-center justify-center gap-2 w-full h-full">
            <Share2 size={18} />
            <span className="text-sm font-medium">Share</span>
          </div>

        </div>

        {/* Icons Layer (Under Share) */}
        <div className="absolute bg-[#F1F1FA] inset-0 flex items-center justify-center gap-3 translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0">

          <button className="text-primary rounded-full hover:scale-110 transition">
            <FaWhatsapp size={20} />
          </button>

          <button className="text-primary rounded-full hover:scale-110 transition">
            <FaEnvelope size={20} />
          </button>

          <button className="text-primary rounded-full hover:scale-110 transition">
            <Download size={20} />
          </button>

        </div>

      </div>

    </div>
  );
};

export default ShareButton;
