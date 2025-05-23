import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Coffee, Leaf, Calendar, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

const CafeSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useTranslation();

  return (
    <div className="h-full w-64 bg-coffee-cream/20 border-r border-coffee-light/20 p-4">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-6 px-2">
          <div className="bg-coffee-light/20 p-2 rounded-lg mr-2">
            <Coffee className="h-8 w-8 text-coffee" />
          </div>
          <h2 className="text-coffee-dark font-bold">{t("cafe.dashboard")}</h2>
        </div>

        <nav className="space-y-1 flex-1">
          <Link
            to="/cafe/dashboard"
            className={`sidebar-link ${
              pathname === "/cafe/dashboard" ? "active" : ""
            }`}
          >
            <Home className="h-5 w-5" />
            <span>{t("cafe.dashboard")}</span>
          </Link>
          <Link
            to="/cafe/beans"
            className={`sidebar-link ${
              pathname === "/cafe/beans" ? "active" : ""
            }`}
          >
            <Coffee className="h-5 w-5" />
            <span>{t("cafe.beans")}</span>
          </Link>
          <Link
            to="/cafe/grounds"
            className={`sidebar-link ${
              pathname === "/cafe/grounds" ? "active" : ""
            }`}
          >
            <Leaf className="h-5 w-5" />
            <span>{t("cafe.grounds")}</span>
          </Link>
          <Link
            to="/cafe/requests"
            className={`sidebar-link ${
              pathname === "/cafe/requests" ? "active" : ""
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>{t("cafe.requests")}</span>
          </Link>
          <Link
            to="/cafe/settings"
            className={`sidebar-link ${
              pathname === "/cafe/settings" ? "active" : ""
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>{t("cafe.settings")}</span>
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-coffee-light/20">
          <div className="px-4 py-2 bg-coffee-cream/50 rounded-lg">
            <p className="text-sm text-coffee-dark">
              {t("common.login")}: {t("auth.cafe_owner")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeSidebar;
