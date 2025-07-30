"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var jsxRuntime = require("react/jsx-runtime"), sanity = require("sanity"), react = require("react"), ui = require("@sanity/ui"), groq = require("groq");
function PermissionNotice({ roles }) {
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Card, { padding: 4, radius: 3, shadow: 1, style: { maxWidth: 500, margin: "2rem auto" }, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Stack, { space: 4, children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: 2, weight: "semibold", children: [
    "Tool can only be used by the following roles:",
    " ",
    roles.map(
      (role) => role.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    ).join(", ")
  ] }) }) });
}
function DocumentTypeSelect({
  docTypes,
  selectedType,
  setSelectedType,
  forceRender
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Flex, { align: "center", gap: 2, children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Document Type:" }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Box, { flex: 1, children: /* @__PURE__ */ jsxRuntime.jsxs(
      ui.Select,
      {
        value: selectedType,
        onChange: (e) => setSelectedType(e.currentTarget.value),
        style: { minWidth: 180 },
        fontSize: 2,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", children: "Select type" }),
          docTypes.map((type) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: type.name, children: type.title }, type.name))
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.Button,
      {
        mode: "ghost",
        tone: "primary",
        padding: 2,
        style: { minWidth: 0 },
        onClick: forceRender,
        disabled: !selectedType,
        title: "Force re-render",
        children: "\u21BB"
      }
    )
  ] });
}
function DocumentList({
  documentsData,
  stronglyReferencedDocs,
  isDocSelected,
  handleSelectDoc
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Box, { style: { maxHeight: 300, overflowY: "auto" }, children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Stack, { space: 2, children: [
    documentsData.map((doc) => /* @__PURE__ */ jsxRuntime.jsxs(ui.Flex, { align: "center", gap: 2, children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Checkbox, { checked: isDocSelected(doc), onChange: () => handleSelectDoc(doc._id) }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        ui.Text,
        {
          style: {
            color: doc._id.includes("draft") ? "#b26b00" : doc._id.includes("versions") ? "#0074d9" : "#007a1c",
            cursor: "pointer",
            userSelect: "none"
          },
          onClick: () => handleSelectDoc(doc._id),
          tabIndex: 0,
          role: "button",
          "aria-pressed": isDocSelected(doc),
          onKeyUp: (e) => {
            (e.key === "Enter" || e.key === " ") && handleSelectDoc(doc._id);
          },
          children: [
            doc.title || doc.name || doc.prefLabel || doc._id,
            doc.hasWeakReferences && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { as: "span", size: 1, style: { marginLeft: 8, color: "#b26b00" }, children: "(Has weak reference)" })
          ]
        }
      )
    ] }, doc._id)),
    stronglyReferencedDocs.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Box, { marginTop: 3, marginBottom: 1, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: 1, weight: "semibold", muted: !0, children: "Documents with strong references (cannot delete):" }) }),
      stronglyReferencedDocs.map((doc) => /* @__PURE__ */ jsxRuntime.jsxs(ui.Flex, { align: "center", gap: 2, style: { opacity: 0.5 }, children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Checkbox, { checked: !1, disabled: !0 }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: doc.title || doc.name || doc.prefLabel || doc._id })
      ] }, doc._id))
    ] })
  ] }) });
}
function ConfirmDeleteDialog({
  show,
  onCancel,
  onDelete,
  loading,
  count
}) {
  return show ? /* @__PURE__ */ jsxRuntime.jsx(
    ui.Dialog,
    {
      id: "confirm-delete-dialog",
      header: "Confirm Deletion",
      onClose: onCancel,
      width: 1,
      zOffset: 1e3,
      footer: /* @__PURE__ */ jsxRuntime.jsxs(ui.Flex, { justify: "flex-end", gap: 2, children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { text: "Cancel", mode: "bleed", onClick: onCancel }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { text: "Delete", tone: "critical", loading, onClick: onDelete })
      ] }),
      children: /* @__PURE__ */ jsxRuntime.jsx(ui.Box, { padding: 4, children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { children: [
        "Are you sure you want to delete ",
        count,
        " document",
        count > 1 ? "s" : "",
        "? This action cannot be undone."
      ] }) })
    }
  ) : null;
}
const BulkDeleteComponent = (config) => {
  const { schemaTypes } = config || {}, [docTypes, setDocTypes] = react.useState([]), [selectedType, setSelectedType] = react.useState(""), [selectedDocs, setSelectedDocs] = react.useState(/* @__PURE__ */ new Set()), [loading, setLoading] = react.useState(!1), [documentsData, setDocumentsData] = react.useState([]), [typesData, setTypesData] = react.useState([]), [_, forceRender] = react.useState(0), [stronglyReferencedDocs, setStronglyReferencedDocs] = react.useState([]), [showConfirm, setShowConfirm] = react.useState(!1), currentUser = sanity.useCurrentUser(), perspective = sanity.usePerspective(), perspectiveName = perspective.selectedPerspectiveName || perspective.selectedPerspective, sanityClient = sanity.useClient({ apiVersion: "2025-05-29" }), toast = ui.useToast(), perspectiveMatch = perspectiveName === "published" ? '!(_id in path("drafts.**") || _id in path("versions.**")) &&' : perspectiveName === "drafts" ? '(_id in path("drafts.**")) &&' : sanity.isString(perspectiveName) ? `(_id in path("versions.${perspectiveName}.**")) &&` : "";
  if (!currentUser?.roles?.some(
    (role) => role.name === "administrator" || config.roles?.includes(role.name)
  )) {
    const roles = config.roles ? Array.from(/* @__PURE__ */ new Set([...config.roles, "administrator"])) : ["administrator"];
    return /* @__PURE__ */ jsxRuntime.jsx(PermissionNotice, { roles });
  }
  const fetchDocuments = async ({
    type,
    hasStrongRefs
  }) => {
    const query = groq.defineQuery(
      `*[ ${perspectiveMatch} _type == "${type}" && ${hasStrongRefs ? "count(*[references(^._id) && (!defined(_weak) || _weak != true)]) > 0" : "count(*[references(^._id) && (!defined(_weak) || _weak != true)]) == 0"}]{_id, _type, title, prefLabel, name${hasStrongRefs ? "" : ', "hasWeakReferences": count(*[references(^._id) && defined(_weak) && _weak == true]) > 0'}}`
    );
    return sanityClient.fetch(query, {}, { perspective: "raw" });
  };
  react.useEffect(() => {
    (async () => {
      const query = groq.defineQuery("array::unique(*[]._type)"), data = await sanityClient.fetch(query, {}, { perspective: "raw" });
      setTypesData(data);
    })();
  }, [sanityClient]), react.useEffect(() => {
    if (!selectedType) {
      setDocumentsData([]), setStronglyReferencedDocs([]);
      return;
    }
    setLoading(!0), Promise.all([
      fetchDocuments({ type: selectedType, hasStrongRefs: !1 }),
      fetchDocuments({ type: selectedType, hasStrongRefs: !0 })
    ]).then(([docs, strongRefs]) => {
      setDocumentsData(docs), setStronglyReferencedDocs(strongRefs);
    }).finally(() => setLoading(!1));
  }, [selectedType, sanityClient, perspectiveMatch, _]), react.useEffect(() => {
    const types = schemaTypes?.filter((type) => type.type === "document" && !type.hidden).map((type) => ({
      name: type.name,
      title: type.title || type.name
    })).sort((a, b) => a.title.localeCompare(b.title)) || [], typesFromQuery = typesData.map((name) => ({
      name,
      title: `Not Found in Schema - ${name}`
    })), mergedTypes = [
      ...types,
      ...typesFromQuery.filter((tq) => !types.some((t) => t.name === tq.name))
    ].filter((type) => !type.name.includes("."));
    setDocTypes(mergedTypes);
  }, [typesData, schemaTypes]);
  const isDocSelected = react.useCallback(
    (doc) => Array.from(selectedDocs).some((h) => h._id === doc._id && h._type === doc._type),
    [selectedDocs]
  ), handleSelectDoc = react.useCallback(
    (id) => {
      setSelectedDocs((prev) => {
        const doc = documentsData.find((d) => d._id === id);
        if (!doc) return prev;
        const exists = Array.from(prev).some((h) => h._id === doc._id && h._type === doc._type), newSet = new Set(prev);
        return exists ? Array.from(newSet).forEach((h) => {
          h._id === doc._id && h._type === doc._type && newSet.delete(h);
        }) : newSet.add({ _id: doc._id, _type: doc._type }), newSet;
      });
    },
    [documentsData]
  ), handleSelectAll = react.useCallback(() => {
    selectedDocs.size === documentsData.length ? setSelectedDocs(/* @__PURE__ */ new Set()) : setSelectedDocs(new Set(documentsData.map((doc) => ({ _id: doc._id, _type: doc._type }))));
  }, [selectedDocs, documentsData]), handleDelete = react.useCallback(async () => {
    if (setShowConfirm(!1), selectedDocs.size !== 0) {
      setLoading(!0);
      try {
        const tx = sanityClient.transaction();
        Array.from(selectedDocs).forEach((doc) => {
          tx.delete(doc._id);
        }), await tx.commit(), toast.push({
          status: "success",
          title: `${selectedDocs.size} Documents Deleted`
        }), setSelectedDocs(/* @__PURE__ */ new Set());
        const docs = await fetchDocuments({ type: selectedType, hasStrongRefs: !1 });
        setDocumentsData(docs);
      } catch (e) {
        toast.push({
          status: "error",
          title: "Error Deleting Documents",
          description: e instanceof Error ? e.message : String(e)
        }), console.error("Error deleting documents:", e);
      } finally {
        setLoading(!1);
      }
    }
  }, [selectedDocs, sanityClient, selectedType, documentsData, perspectiveMatch]);
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Card, { padding: 4, radius: 3, shadow: 1, style: { maxWidth: 500, margin: "2rem auto" }, children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Stack, { space: 4, children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: 2, weight: "semibold", children: "Bulk Delete Documents" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      DocumentTypeSelect,
      {
        docTypes,
        selectedType,
        setSelectedType,
        forceRender: () => forceRender((n) => n + 1)
      }
    ),
    loading && /* @__PURE__ */ jsxRuntime.jsxs(ui.Flex, { align: "center", gap: 2, children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Spinner, { muted: !0 }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Loading..." })
    ] }),
    selectedType && !loading && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          mode: "bleed",
          tone: "primary",
          onClick: handleSelectAll,
          disabled: documentsData.length === 0,
          text: documentsData.length === 0 ? "No Documents Found" : selectedDocs.size === documentsData.length ? "Deselect All" : "Select All"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        DocumentList,
        {
          documentsData,
          stronglyReferencedDocs,
          isDocSelected,
          handleSelectDoc
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          tone: "critical",
          disabled: selectedDocs.size === 0 || loading,
          onClick: () => setShowConfirm(!0),
          text: `Delete Selected (${selectedDocs.size})`
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ConfirmDeleteDialog,
        {
          show: showConfirm,
          onCancel: () => setShowConfirm(!1),
          onDelete: handleDelete,
          loading,
          count: selectedDocs.size
        }
      )
    ] })
  ] }) });
}, BulkDelete = sanity.definePlugin((config) => ({
  name: "sanity-plugin-bulk-delete",
  tools: [
    {
      name: "bulk-delete",
      title: "Bulk Delete",
      component: function() {
        return /* @__PURE__ */ jsxRuntime.jsx(ui.ToastProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(BulkDeleteComponent, { ...config }) });
      }
    }
  ]
}));
exports.BulkDelete = BulkDelete;
//# sourceMappingURL=index.js.map
