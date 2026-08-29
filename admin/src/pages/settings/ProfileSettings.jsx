import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

const initialProfile = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  role: "Administrator",
  image: "",
};

function ProfileSettings() {
  const [profile, setProfile] =
    useState(initialProfile);

  const [loading, setLoading] =
    useState(true);

  const [processingImage, setProcessingImage] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const showMessage = (text, type = "") => {
    setMessage(text);
    setMessageType(type);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        showMessage("");

        const response = await fetch(
          `${API_URL}/admin/profile`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load profile."
          );
        }

        setProfile({
          fullName:
            data.name ||
            data.fullName ||
            "",
          username:
            data.username || "admin",
          email: data.email || "",
          phone: data.phone || "",
          role: "Administrator",
          image:
            data.image ||
            data.image_url ||
            "",
        });
      } catch (error) {
        console.error(
          "Load profile error:",
          error
        );

        showMessage(
          error.message ||
            "Unable to load profile.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      value,
    }));

    showMessage("");
  };

  const compressImage = (
    file,
    maxWidth = 500,
    maxHeight = 500,
    quality = 0.72
  ) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const imageElement = new Image();

        imageElement.onload = () => {
          const originalWidth =
            imageElement.naturalWidth;

          const originalHeight =
            imageElement.naturalHeight;

          const scale = Math.min(
            maxWidth / originalWidth,
            maxHeight / originalHeight,
            1
          );

          const width = Math.max(
            1,
            Math.round(originalWidth * scale)
          );

          const height = Math.max(
            1,
            Math.round(originalHeight * scale)
          );

          const canvas =
            document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext("2d");

          if (!context) {
            reject(
              new Error(
                "Image processing is not available."
              )
            );

            return;
          }

          context.fillStyle = "#ffffff";
          context.fillRect(
            0,
            0,
            width,
            height
          );

          context.drawImage(
            imageElement,
            0,
            0,
            width,
            height
          );

          const compressedDataUrl =
            canvas.toDataURL(
              "image/jpeg",
              quality
            );

          resolve(compressedDataUrl);
        };

        imageElement.onerror = () => {
          reject(
            new Error(
              "Could not process the selected image."
            )
          );
        };

        imageElement.src = String(
          reader.result || ""
        );
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Could not read the selected image."
          )
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    showMessage("");

    if (!file.type.startsWith("image/")) {
      showMessage(
        "Please choose an image file.",
        "error"
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage(
        "Please choose an image smaller than 5MB.",
        "error"
      );

      event.target.value = "";
      return;
    }

    try {
      setProcessingImage(true);

      const compressedImage =
        await compressImage(file);

      setProfile((currentProfile) => ({
        ...currentProfile,
        image: compressedImage,
      }));

      showMessage(
        "Photo selected. Click Save Profile to save it.",
        "success"
      );
    } catch (error) {
      console.error(
        "Image processing error:",
        error
      );

      showMessage(
        error.message ||
          "Unable to process the selected image.",
        "error"
      );

      event.target.value = "";
    } finally {
      setProcessingImage(false);
    }
  };

  const removePhoto = () => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      image: "",
    }));

    showMessage(
      "Photo removed. Click Save Profile to confirm.",
      "success"
    );
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    const fullName =
      profile.fullName.trim();

    const username =
      profile.username.trim();

    const email =
      profile.email
        .trim()
        .toLowerCase();

    const phone =
      profile.phone.trim();

    if (!fullName) {
      showMessage(
        "Full name is required.",
        "error"
      );

      return;
    }

    if (!username) {
      showMessage(
        "Username is required.",
        "error"
      );

      return;
    }

    if (!email) {
      showMessage(
        "Email is required.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);
      showMessage("");

      const response = await fetch(
        `${API_URL}/admin/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            fullName,
            username,
            email,
            phone,
            image: profile.image || "",
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update profile."
        );
      }

      const updatedUser =
        data.user || data;

      const updatedProfile = {
        fullName:
          updatedUser.name ||
          updatedUser.fullName ||
          fullName,

        username:
          updatedUser.username ||
          username,

        email:
          updatedUser.email ||
          email,

        phone:
          updatedUser.phone ||
          phone,

        role: "Administrator",

        image:
          updatedUser.image ??
          profile.image ??
          "",
      };

      setProfile(updatedProfile);

      localStorage.setItem(
        "adminProfile",
        JSON.stringify(updatedUser)
      );

      const storedUser =
        localStorage.getItem(
          "currentUser"
        );

      if (storedUser) {
        try {
          const currentUser =
            JSON.parse(storedUser);

          const newCurrentUser = {
            ...currentUser,
            ...updatedUser,
            name:
              updatedUser.name ||
              fullName,
            username:
              updatedUser.username ||
              username,
            email:
              updatedUser.email ||
              email,
            phone:
              updatedUser.phone ||
              phone,
            image:
              updatedUser.image ??
              profile.image ??
              "",
          };

          localStorage.setItem(
            "currentUser",
            JSON.stringify(
              newCurrentUser
            )
          );
        } catch (storageError) {
          console.warn(
            "Could not update currentUser:",
            storageError
          );
        }
      }

      showMessage(
        "Profile updated successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Save profile error:",
        error
      );

      showMessage(
        error.message ||
          "Profile update failed.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-card">
        <h2>Profile Settings</h2>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="settings-card">
      <h2>Profile Settings</h2>

      <form onSubmit={saveProfile}>
        <div className="settings-grid">
          <div className="form-group full">
            <label htmlFor="profileImage">
              Profile Photo
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  overflow: "hidden",
                  border:
                    "2px solid #dddddd",
                  borderRadius: "50%",
                  backgroundColor:
                    "#f2f2f2",
                }}
              >
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    role="img"
                    aria-label="Profile"
                    style={{
                      fontSize: "30px",
                    }}
                  >
                    👤
                  </span>
                )}
              </div>

              <div>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImage}
                  disabled={
                    saving ||
                    processingImage
                  }
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#667085",
                  }}
                >
                  JPG, PNG or WebP, maximum
                  5MB. The image is resized
                  automatically.
                </small>

                {processingImage && (
                  <p
                    style={{
                      marginTop: "8px",
                      color: "#8b5e3c",
                    }}
                  >
                    Processing image...
                  </p>
                )}

                {profile.image && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    disabled={saving}
                    style={{
                      display: "block",
                      marginTop: "8px",
                      padding: 0,
                      border: "none",
                      color: "#b42318",
                      background:
                        "transparent",
                      cursor: "pointer",
                    }}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              disabled={saving}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              disabled={saving}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={saving}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">
              Role
            </label>

            <input
              id="role"
              type="text"
              value={profile.role}
              disabled
            />
          </div>
        </div>

        {message && (
          <div
            role="status"
            style={{
              marginTop: "14px",
              padding: "11px 13px",
              borderRadius: "7px",
              color:
                messageType === "success"
                  ? "#15803d"
                  : "#b42318",
              backgroundColor:
                messageType === "success"
                  ? "#f0fdf4"
                  : "#fef2f2",
              border:
                messageType === "success"
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
            }}
          >
            {message}
          </div>
        )}

        <div className="settings-buttons">
          <button
            type="submit"
            className="btn-save-settings"
            disabled={
              saving ||
              processingImage
            }
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileSettings;