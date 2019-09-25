import React, { useContext } from "react";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import makeClassnames from "classnames";
import { Link } from "../Link";
import "./header.styles.scss";
import { EXPERIENCES_URL, ROOT_URL } from "../../routes";
import { LayoutContextHeader, LocationContext } from "../Layout/layout.utils";
import {
  UPLOAD_UNSAVED_PREVIEW_URL,
  UPLOAD_UNSAVED_URL_START,
} from "../../constants/upload-unsaved-routes";
import { useUser } from "../use-user";
import { SetStateAction, PropsWithChildren } from "react";
import { LogoImageQuery_file_childImageSharp_fixed } from "../../graphql/gatsby-types/LogoImageQuery";
import { useLogo } from "./header.injectables";

export const Header = (props: Props) => {
  const {
    title,
    sidebar,
    toggleShowSidebar,
    show,
    children,
    className = "",
  } = props;

  const user = useUser();
  const logoAttrs = useLogo();
  const { navigate, pathname } = useContext(LocationContext);

  const isHome = pathname === EXPERIENCES_URL || pathname === ROOT_URL;

  const { unsavedCount, hasConnection } = useContext(LayoutContextHeader);

  const asUrlProps = isHome
    ? {}
    : {
        onClick: () => navigate(user ? EXPERIENCES_URL : ROOT_URL),
      };

  return (
    <header
      className={makeClassnames({
        "components-header": true,
        [className]: true,
        "header--connected": hasConnection,
        "header--disconnected": !hasConnection,
      })}
    >
      <Menu secondary={true}>
        <style>{getLogoStyle(logoAttrs)}</style>

        <Menu.Item
          id="header-logo-container"
          className={makeClassnames({
            "logo-container": true,
            "with-pointer": !isHome,
            "center-children": !sidebar,
          })}
          {...asUrlProps}
        >
          <div id="components-header-logo" />
        </Menu.Item>

        {sidebar && (
          <Menu.Item
            position="right"
            className="sidebar-trigger"
            onClick={() => toggleShowSidebar && toggleShowSidebar(!show)}
            id="header-sidebar-trigger"
          >
            {show ? (
              <Icon
                id="header-close-sidebar-icon"
                className="close-sidebar-icon"
                name="close"
              />
            ) : (
              <Icon id="header-show-sidebar-icon" name="content" />
            )}
          </Menu.Item>
        )}
      </Menu>

      {unsavedCount > 0 && !pathname.includes(UPLOAD_UNSAVED_URL_START) && (
        <Link
          to={UPLOAD_UNSAVED_PREVIEW_URL}
          id="header-unsaved-count-label"
          className="unsaved-count-label"
        >
          {unsavedCount}
        </Link>
      )}

      {(title || children) &&
        (title ? (
          <div
            id="header-app-header-title"
            className={makeClassnames({
              "app-header-title": true,
              "no-sidebar": !sidebar,
            })}
          >
            {title}
          </div>
        ) : (
          children
        ))}
    </header>
  );
};

function getLogoStyle(logoAttrs: LogoImageQuery_file_childImageSharp_fixed) {
  const { src, width, height } = logoAttrs;
  return `#components-header-logo{ background: url(${src}) no-repeat 0 !important; background-size: ${width}px ${height}px !important; min-width: ${width}px; min-height: ${height}px;}`;
}

////////////////////////// TYPES ////////////////////////////

export interface OwnProps {
  title?: string;
  wide?: boolean;
  sidebar?: boolean;
  show?: boolean;
  toggleShowSidebar?: React.Dispatch<SetStateAction<boolean>>;
  className?: string;
}

export type Props = PropsWithChildren<OwnProps>;
