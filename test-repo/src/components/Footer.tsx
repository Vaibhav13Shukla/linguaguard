// THIS FILE IS CLEAN - uses t() correctly
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-8 text-center text-gray-500">
      <p>{t("footer.copyright")}</p>
      <p>{t("footer.builtWith")}</p>
    </footer>
  );
}
