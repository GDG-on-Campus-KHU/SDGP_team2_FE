// src/components/Footer.tsx (Modified with i18n)
import React from "react";
import { Coffee } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-coffee-dark text-white py-2">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Coffee className="h-5 w-5 text-coffee-cream" />
          <span className="text-md font-bold">Eco Bean</span>
        </div>
        <p className="text-xs text-coffee-muted">
          © {new Date().getFullYear()} Eco Bean.{" "}
          {t("footer.all_rights_reserved")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
