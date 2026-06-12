// =============================================================
// Formspree endpoints - sửa các URL ở đây khi cần thay form.
// =============================================================
const FORM_ENDPOINTS = {
  memory: "https://formspree.io/f/mpqbvwqr",
  message: "https://formspree.io/f/mvzlegzb",
  performance: "https://formspree.io/f/xwvjrnoq"
};

// =============================================================
// Cloudinary unsigned upload.
// Không đặt API secret trong file frontend.
// =============================================================
const CLOUDINARY_CONFIG = {
  cloudName: "dauhqkpzj",
  uploadPreset: "rdm15sl5",
  folder: "20-nam-hoi-ngo"
};

const FORM_SUBMISSION_FIELDS = {
  memory: [
    ["form_type"],
    ["full_name", "name"],
    ["old_class"],
    ["content_type"],
    ["photo_link"],
    ["shared_story", "message"],
    ["usage_permission"]
  ],
  message: [
    ["form_type"],
    ["full_name", "name"],
    ["old_class"],
    ["message_recipient"],
    ["message_content", "message"],
    ["sharing_permission"]
  ],
  performance: [
    ["form_type"],
    ["full_name", "name"],
    ["phone_zalo", "phone"],
    ["performance_title", "message"],
    ["performance_order"]
  ]
};

const SUCCESS_MESSAGES = {
  memory: "Cảm ơn bạn đã gửi kỷ niệm. Những hình ảnh và câu chuyện này sẽ giúp buổi gặp lại có thêm nhiều cảm xúc.",
  message: "Cảm ơn bạn đã gửi lời nhắn. Một phần thanh xuân đã được cất lại thật đẹp.",
  performance: "Cảm ơn bạn đã đăng ký giao lưu văn nghệ. Ban tổ chức sẽ tổng hợp và sắp xếp thứ tự biểu diễn."
};

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const tabContainers = document.querySelectorAll("[data-tabs]");

tabContainers.forEach((container) => {
  const buttons = Array.from(container.querySelectorAll(".tab-button"));
  const panels = Array.from(container.querySelectorAll(".tab-panel"));

  function getPanelIdFromHash(hash) {
    const targetId = hash.replace(/^#/, "");

    if (panels.some((panel) => panel.id === targetId)) {
      return targetId;
    }

    if (targetId.endsWith("-form")) {
      const form = document.getElementById(targetId);
      const panel = form?.closest(".tab-panel");
      return panel?.id || "";
    }

    return "";
  }

  function activateTab(targetId) {
    const targetPanel = panels.find((panel) => panel.id === targetId);

    if (!targetPanel) {
      return false;
    }

    buttons.forEach((item) => {
      const isCurrent = item.getAttribute("aria-controls") === targetId;
      item.classList.toggle("is-active", isCurrent);
      item.setAttribute("aria-selected", String(isCurrent));
    });

    panels.forEach((panel) => {
      const isCurrent = panel.id === targetId;
      panel.classList.toggle("is-active", isCurrent);
      panel.hidden = !isCurrent;
    });

    return true;
  }

  function activateHashTarget(shouldScroll) {
    const hash = window.location.hash;
    const panelId = getPanelIdFromHash(hash);

    if (!panelId || !activateTab(panelId)) {
      return;
    }

    if (shouldScroll) {
      requestAnimationFrame(() => {
        const target = document.getElementById(hash.slice(1)) || document.getElementById(panelId);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("aria-controls");
      activateTab(targetId);
    });
  });

  if (window.location.hash) {
    activateHashTarget(false);
  }

  window.addEventListener("hashchange", () => {
    activateHashTarget(true);
  });
});

function setStatus(form, message, type) {
  const status = form.querySelector("[data-status]");
  if (!status) return;
  status.textContent = message;
  status.className = `form-status ${type || ""}`.trim();
}

function getSubmitButton(form) {
  return form.querySelector('button[type="submit"]');
}

function setLoading(form, isLoading) {
  const button = getSubmitButton(form);
  if (!button) return;

  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = "Đang gửi...";
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function hasCloudinaryConfig() {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;
  return Boolean(cloudName && uploadPreset);
}

function getImageUploadInputs(form) {
  return Array.from(form.querySelectorAll('input[type="file"]')).filter((input) => {
    const accept = input.getAttribute("accept") || "";
    return accept.includes("image") || input.dataset.cloudinaryUpload === "image";
  });
}

function getSelectedImageFiles(form) {
  return getImageUploadInputs(form).flatMap((input) =>
    Array.from(input.files || []).map((file) => ({
      fieldName: input.name || "uploaded_images",
      file
    }))
  );
}

function appendFieldIfPresent(formData, form, sourceName, targetName = sourceName) {
  const field = form.elements[sourceName];

  if (!field) {
    return;
  }

  if (field instanceof RadioNodeList) {
    const checkedField = Array.from(field).find((item) => item.checked);
    if (checkedField?.value?.trim()) {
      formData.append(targetName, checkedField.value.trim());
    }
    return;
  }

  if (field.type === "checkbox") {
    if (field.checked && field.value.trim()) {
      formData.append(targetName, field.value.trim());
    }
    return;
  }

  const value = field.value?.trim();
  if (value) {
    formData.append(targetName, value);
  }
}

function buildFormspreePayload(form, uploadedImages) {
  const endpointKey = form.dataset.endpointKey;
  const formData = new FormData();
  const fields = FORM_SUBMISSION_FIELDS[endpointKey] || [];

  fields.forEach(([sourceName, targetName]) => {
    appendFieldIfPresent(formData, form, sourceName, targetName);
  });

  if (uploadedImages.length) {
    formData.append("cloudinary_images", uploadedImages.map((image) => image.url).join("\n"));
  }

  return formData;
}

function validateSelectedImages(selectedImages) {
  const invalidFile = selectedImages.find(({ file }) => file.type && !file.type.startsWith("image/"));
  if (invalidFile) {
    throw new Error(`"${invalidFile.file.name}" không phải là file ảnh hợp lệ.`);
  }
}

function getCloudinaryUploadErrorMessage(result) {
  const message = result?.error?.message || "";

  if (message.toLowerCase().includes("must be whitelisted for unsigned uploads")) {
    return `Cloudinary chưa bật unsigned upload cho preset "${CLOUDINARY_CONFIG.uploadPreset}". Vào Cloudinary Upload Presets và đổi preset này sang Signing Mode: Unsigned, hoặc tạo một unsigned preset mới rồi cập nhật script.js.`;
  }

  return message
    ? `Không tải được ảnh lên Cloudinary: ${message}`
    : "Không tải được ảnh lên Cloudinary. Bạn vui lòng thử lại.";
}

async function uploadImageToCloudinary(file) {
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

  if (CLOUDINARY_CONFIG.folder) {
    uploadData.append("folder", CLOUDINARY_CONFIG.folder);
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    CLOUDINARY_CONFIG.cloudName
  )}/image/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: uploadData
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.secure_url) {
    throw new Error(getCloudinaryUploadErrorMessage(result));
  }

  return {
    fileName: file.name,
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    format: result.format
  };
}

async function uploadSelectedImages(form, selectedImages) {
  if (!selectedImages.length) {
    return [];
  }

  if (!hasCloudinaryConfig()) {
    throw new Error("Chưa cấu hình Cloudinary cloudName/uploadPreset.");
  }

  validateSelectedImages(selectedImages);

  const uploadedImages = [];

  for (const [index, selectedImage] of selectedImages.entries()) {
    setStatus(
      form,
      `Đang tải ảnh lên Cloudinary (${index + 1}/${selectedImages.length})...`,
      ""
    );

    const uploadedImage = await uploadImageToCloudinary(selectedImage.file);
    uploadedImages.push({
      fieldName: selectedImage.fieldName,
      ...uploadedImage
    });
  }

  return uploadedImages;
}

function attachFormHandlers() {
  const forms = document.querySelectorAll("[data-form]");

  forms.forEach((form) => {
    const endpointKey = form.dataset.endpointKey;
    const endpoint = FORM_ENDPOINTS[endpointKey];

    if (endpoint) {
      form.setAttribute("action", endpoint);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus(form, "", "");

      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus(form, "Bạn vui lòng kiểm tra lại các trường bắt buộc trước khi gửi.", "error");
        return;
      }

      if (!endpoint) {
        setStatus(form, "Chưa cấu hình endpoint Formspree cho form này.", "error");
        return;
      }

      const selectedImages = getSelectedImageFiles(form);
      setLoading(form, true);

      try {
        const uploadedImages = await uploadSelectedImages(form, selectedImages);
        const formData = buildFormspreePayload(form, uploadedImages);

        if (uploadedImages.length) {
          setStatus(form, "Ảnh đã tải lên Cloudinary. Đang gửi thông tin qua Formspree...", "");
        }

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Formspree chưa nhận được thông tin. Bạn vui lòng thử lại.");
        }

        form.reset();
        setStatus(form, SUCCESS_MESSAGES[endpointKey] || "Cảm ơn bạn đã gửi thông tin.", "success");
      } catch (error) {
        setStatus(
          form,
          error.message || "Rất tiếc, form chưa gửi được. Bạn vui lòng thử lại hoặc liên hệ ban liên lạc.",
          "error"
        );
      } finally {
        setLoading(form, false);
      }
    });
  });
}

attachFormHandlers();
