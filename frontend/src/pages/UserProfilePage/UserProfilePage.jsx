import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Avatar,
  Button,
  Spin,
  Empty,
  Tag,
  Divider,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkedinOutlined,
  GithubOutlined,
  GlobalOutlined,
  TwitterOutlined,
  EditOutlined,
  CalendarOutlined,
  SaveOutlined,
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api.service";
import styles from "./UserProfilePage.module.css";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { userProfile, user, loading, isAuthenticated, fetchUserProfile } =
    useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      fetchUserProfile();
    }
  }, [isAuthenticated, userProfile, fetchUserProfile]);

  const [pagination, setPagination] = useState({
    count: 0,
    lastEvaluatedKey: null,
    limit: 20,
  });

  const fetchResumes = useCallback(async (lastKey = null) => {
    setResumesLoading(true);
    try {
      const limit = 20;
      const params = {
        limit,
      };
      if (lastKey) {
        params.lastEvaluatedKey = lastKey;
      }

      const response = await API.resume.getResumes(params);
      console.log("Resumes API Response:", response.data);

      if (response.data?.success) {
        const data = response.data.data;
        console.log("Resumes data:", data);
        setResumes(data.resumes || []);
        setPagination({
          count: data.count || 0,
          lastEvaluatedKey: data.lastEvaluatedKey || null,
          limit,
        });
      } else {
        console.warn("API response not successful:", response.data);
        setResumes([]);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Show error message for debugging
      message.error(
        "Failed to load resumes. Please check console for details."
      );
      setResumes([]);
    } finally {
      setResumesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    }
  }, [isAuthenticated, fetchResumes]);

  const handleEditResume = (resumeId) => {
    navigate(`/editor?resumeId=${resumeId}`);
  };

  const handleDeleteResume = async (resumeId, resumeName) => {
    try {
      await API.resume.deleteResume(resumeId);
      message.success(`Resume "${resumeName}" deleted successfully`);
      fetchResumes();
    } catch (error) {
      console.error("Error deleting resume:", error);
      message.error("Failed to delete resume. Please try again.");
    }
  };

  const formatResumeDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getSectionCount = (sections) => {
    if (!sections) return 0;
    return Object.values(sections).reduce(
      (total, sectionArray) => total + (sectionArray?.length || 0),
      0
    );
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth?tab=login");
    }
  }, [loading, isAuthenticated, navigate]);

  // Initialize form with current profile data when modal opens
  useEffect(() => {
    if (isEditModalOpen && userProfile) {
      const personalInfo = userProfile.personalInfo || {};
      form.setFieldsValue({
        name: personalInfo.name || "",
        email: personalInfo.email || userProfile.email || "",
        phone: personalInfo.phone || "",
        location: personalInfo.location || "",
        linkedin: personalInfo.linkedin || "",
        github: personalInfo.github || "",
        portfolio: personalInfo.portfolio || "",
        summary: personalInfo.summary || "",
        twitter: personalInfo.customFields?.twitter || "",
      });
    }
  }, [isEditModalOpen, userProfile, form]);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCancel = () => {
    setIsEditModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setUpdating(true);
    try {
      // Build personalInfo object, only including fields with values
      const personalInfo = {
        name: values.name,
        email: values.email,
      };

      // Add optional fields only if they have values
      if (values.phone?.trim()) personalInfo.phone = values.phone.trim();
      if (values.location?.trim())
        personalInfo.location = values.location.trim();
      if (values.linkedin?.trim())
        personalInfo.linkedin = values.linkedin.trim();
      if (values.github?.trim()) personalInfo.github = values.github.trim();
      if (values.portfolio?.trim())
        personalInfo.portfolio = values.portfolio.trim();
      if (values.summary?.trim()) personalInfo.summary = values.summary.trim();

      // Add customFields only if twitter has a value
      if (values.twitter?.trim()) {
        personalInfo.customFields = {
          twitter: values.twitter.trim(),
        };
      }

      const updateData = {
        personalInfo,
      };

      const response = await API.user.updateProfile(updateData);

      if (response.data?.success) {
        message.success("Profile updated successfully!");
        setIsEditModalOpen(false);
        form.resetFields();
        // Refresh profile data
        await fetchUserProfile();
        // Refresh resumes
        await fetchResumes();
      } else {
        message.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const personalInfo = userProfile?.personalInfo || {};
  const customFields = personalInfo?.customFields || {};

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        {/* Header Section */}
        <section className={styles.headerSection}>
          <div className={styles.headerContent}>
            <div className={styles.avatarContainer}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                className={styles.avatar}
              />
              <Button
                type="primary"
                icon={<EditOutlined />}
                className={styles.editButton}
                onClick={handleEditClick}
              >
                Edit Profile
              </Button>
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.userName}>
                {personalInfo?.name || user?.name || "User"}
              </h1>
              <p className={styles.userEmail}>
                {userProfile?.email || user?.email || "No email"}
              </p>
              {userProfile?.userId && (
                <Tag color="blue" className={styles.userIdTag}>
                  ID: {userProfile.userId}
                </Tag>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className={styles.contentSection}>
          <div className={styles.sectionContainer}>
            <Row gutter={[24, 24]}>
              {/* Personal Information Card */}
              <Col xs={24} lg={16}>
                <Card
                  title={
                    <span className={styles.cardTitle}>
                      <UserOutlined /> Personal Information
                    </span>
                  }
                  className={styles.card}
                >
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <MailOutlined className={styles.infoIcon} />
                      <div className={styles.infoContent}>
                        <div className={styles.infoLabel}>Email</div>
                        <div className={styles.infoValue}>
                          {personalInfo?.email || userProfile?.email || "N/A"}
                        </div>
                      </div>
                    </div>

                    {personalInfo?.phone && (
                      <div className={styles.infoItem}>
                        <PhoneOutlined className={styles.infoIcon} />
                        <div className={styles.infoContent}>
                          <div className={styles.infoLabel}>Phone</div>
                          <div className={styles.infoValue}>
                            {personalInfo.phone}
                          </div>
                        </div>
                      </div>
                    )}

                    {personalInfo?.location && (
                      <div className={styles.infoItem}>
                        <EnvironmentOutlined className={styles.infoIcon} />
                        <div className={styles.infoContent}>
                          <div className={styles.infoLabel}>Location</div>
                          <div className={styles.infoValue}>
                            {personalInfo.location}
                          </div>
                        </div>
                      </div>
                    )}

                    {personalInfo?.summary && (
                      <div className={styles.infoItemFull}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoLabel}>Summary</div>
                          <div className={styles.infoValue}>
                            {personalInfo.summary}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Social Links & Additional Info */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className={styles.cardTitle}>
                      <GlobalOutlined /> Social Links
                    </span>
                  }
                  className={styles.card}
                >
                  <div className={styles.socialLinks}>
                    {personalInfo?.linkedin && (
                      <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        <LinkedinOutlined /> LinkedIn
                      </a>
                    )}
                    {personalInfo?.github && (
                      <a
                        href={personalInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        <GithubOutlined /> GitHub
                      </a>
                    )}
                    {personalInfo?.portfolio && (
                      <a
                        href={personalInfo.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        <GlobalOutlined /> Portfolio
                      </a>
                    )}
                    {customFields?.twitter && (
                      <a
                        href={customFields.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        <TwitterOutlined /> Twitter
                      </a>
                    )}
                    {!personalInfo?.linkedin &&
                      !personalInfo?.github &&
                      !personalInfo?.portfolio &&
                      !customFields?.twitter && (
                        <Empty
                          description="No social links added"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          className={styles.emptyState}
                        />
                      )}
                  </div>
                </Card>

                <Card
                  title={
                    <span className={styles.cardTitle}>
                      <CalendarOutlined /> Account Information
                    </span>
                  }
                  className={styles.card}
                  style={{ marginTop: 24 }}
                >
                  <div className={styles.accountInfo}>
                    <div className={styles.accountItem}>
                      <div className={styles.accountLabel}>Member Since</div>
                      <div className={styles.accountValue}>
                        {formatDate(userProfile?.createdAt)}
                      </div>
                    </div>
                    <Divider style={{ margin: "12px 0" }} />
                    <div className={styles.accountItem}>
                      <div className={styles.accountLabel}>Last Updated</div>
                      <div className={styles.accountValue}>
                        {formatDate(userProfile?.updatedAt)}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Resumes Section */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24}>
                <Card
                  title={
                    <span className={styles.cardTitle}>
                      <FileTextOutlined /> My Resumes
                    </span>
                  }
                  className={styles.card}
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => navigate("/editor")}
                    >
                      Create New
                    </Button>
                  }
                >
                  {resumesLoading ? (
                    <div className={styles.resumesLoading}>
                      <Spin />
                    </div>
                  ) : resumes.length === 0 ? (
                    <Empty
                      description="No resumes yet. Create your first resume!"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      className={styles.resumesEmpty}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/editor")}
                      >
                        Create Your First Resume
                      </Button>
                    </Empty>
                  ) : (
                    <Row gutter={[16, 16]}>
                      {resumes.map((resume) => (
                        <Col xs={24} sm={12} lg={8} key={resume.resumeId}>
                          <Card
                            className={styles.resumeCard}
                            hoverable
                            actions={[
                              <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() =>
                                  handleEditResume(resume.resumeId)
                                }
                                key="view"
                              >
                                View
                              </Button>,
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleDeleteResume(
                                    resume.resumeId,
                                    resume.name
                                  )
                                }
                                key="delete"
                              >
                                Delete
                              </Button>,
                            ]}
                          >
                            <div className={styles.resumeCardContent}>
                              <div className={styles.resumeCardHeader}>
                                <FileTextOutlined
                                  className={styles.resumeCardIcon}
                                />
                                <div className={styles.resumeCardInfo}>
                                  <h4 className={styles.resumeCardName}>
                                    {resume.name}
                                  </h4>
                                  {resume.templateId && (
                                    <Tag
                                      color="blue"
                                      className={styles.resumeCardTag}
                                    >
                                      {resume.templateId}
                                    </Tag>
                                  )}
                                </div>
                              </div>
                              <div className={styles.resumeCardDetails}>
                                <div className={styles.resumeCardDetailItem}>
                                  <span
                                    className={styles.resumeCardDetailLabel}
                                  >
                                    Sections:
                                  </span>
                                  <span
                                    className={styles.resumeCardDetailValue}
                                  >
                                    {getSectionCount(resume.sections)}
                                  </span>
                                </div>
                                <div className={styles.resumeCardDate}>
                                  <CalendarOutlined
                                    className={styles.resumeCardDateIcon}
                                  />
                                  <span className={styles.resumeCardDateText}>
                                    {formatResumeDate(
                                      resume.updatedAt || resume.createdAt
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                  {!resumesLoading &&
                    resumes.length > 0 &&
                    pagination.count > pagination.limit && (
                      <div className={styles.resumesPagination}>
                        <Pagination
                          current={1}
                          total={pagination.count}
                          pageSize={pagination.limit}
                          onChange={() => fetchResumes()}
                          showSizeChanger={false}
                          showTotal={(total) => `Total ${total} resumes`}
                        />
                      </div>
                    )}
                </Card>
              </Col>
            </Row>
          </div>
        </section>
      </main>

      <Footer />

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={isEditModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        className={styles.editModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.editForm}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input
              placeholder="Enter your phone number"
              prefix={<PhoneOutlined />}
            />
          </Form.Item>

          <Form.Item label="Location" name="location">
            <Input
              placeholder="Enter your location"
              prefix={<EnvironmentOutlined />}
            />
          </Form.Item>

          <Form.Item label="Summary" name="summary">
            <Input.TextArea
              rows={4}
              placeholder="Enter a brief summary about yourself"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Divider orientation="left">Social Links</Divider>

          <Form.Item label="LinkedIn" name="linkedin">
            <Input
              placeholder="https://linkedin.com/in/yourprofile"
              prefix={<LinkedinOutlined />}
            />
          </Form.Item>

          <Form.Item label="GitHub" name="github">
            <Input
              placeholder="https://github.com/yourusername"
              prefix={<GithubOutlined />}
            />
          </Form.Item>

          <Form.Item label="Portfolio" name="portfolio">
            <Input
              placeholder="https://yourportfolio.com"
              prefix={<GlobalOutlined />}
            />
          </Form.Item>

          <Form.Item label="Twitter" name="twitter">
            <Input
              placeholder="https://twitter.com/yourusername"
              prefix={<TwitterOutlined />}
            />
          </Form.Item>

          <Form.Item className={styles.formActions}>
            <Button onClick={handleCancel} disabled={updating}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={updating}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
