"use strict";

exports.__esModule = true;
exports.onPreRenderHTML = void 0;

var onPreRenderHTML = function onPreRenderHTML(_ref) {
  var getHeadComponents = _ref.getHeadComponents,
      pathname = _ref.pathname,
      replaceHeadComponents = _ref.replaceHeadComponents;
  if (pathname !== "/offline-plugin-app-shell-fallback/") return;
  var headComponents = getHeadComponents();
  var filteredHeadComponents = headComponents.filter(function (_ref2) {
    var type = _ref2.type,
        props = _ref2.props;
    return !(type === "link" && props.as === "fetch" && props.rel === "preload" && props.href.startsWith("/static/d/"));
  });
  replaceHeadComponents(filteredHeadComponents);
};

exports.onPreRenderHTML = onPreRenderHTML;