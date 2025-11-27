import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Modal, Form, Input, DatePicker, Select, Upload, message, Spin, Empty } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../config/axios";
import type { UploadRequestOption, UploadFile } from "antd/es/upload/interface";
import "./hamster.scss";
import { toast } from "react-toastify";

const { Option } = Select;

type Gender = "MALE" | "FEMALE";

interface HamsterItem {
  id: number;
  name: string;
  birthDate: string;
  color: string;
  genderEnum: Gender;
  imageUrl: string;
}

interface HamsterResponse {
  code: number;
  data: HamsterItem[];
  message: string;
}

interface CloudinaryResponse {
  secure_url: string;
}

const CLOUDINARY_CLOUD_NAME = "duikwluky";
const CLOUDINARY_UPLOAD_PRESET = "hamster_unsigned";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function Hamster() {
  const [hamsters, setHamsters] = useState<HamsterItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [editingHamster, setEditingHamster] = useState<HamsterItem | null>(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // ====================== LOAD HAMSTERS ===========================
  const fetchHamsters = async () => {
    setLoading(true);
    try {
      const res = await api.get<HamsterResponse>("/hamsters");
      if (res.data.code === 200) setHamsters(res.data.data);
    } catch {
      message.error("Lỗi khi tải danh sách hamster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHamsters();
  }, []);

  // ====================== CLOUDINARY UPLOAD ===========================
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = (await res.json()) as CloudinaryResponse;
    return data.secure_url;
  };

  const handleUpload = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;

    try {
      const url = await uploadToCloudinary(file as File);

      onSuccess?.({ secure_url: url } as CloudinaryResponse, new XMLHttpRequest());
      message.success("Upload thành công");
    } catch (err) {
      message.error("Upload thất bại");
      onError?.(err as Error);
    }
  };

  // ====================== OPEN MODALS ===========================
  const openAddModal = () => {
    addForm.resetFields();
    setAddVisible(true);
  };

  const openEditModal = (h: HamsterItem) => {
    setEditingHamster(h);

    const fileList: UploadFile[] = [
      {
        uid: "-1",
        name: "current-image.jpg",
        status: "done",
        url: h.imageUrl,
        response: { secure_url: h.imageUrl },
      },
    ];

    editForm.setFieldsValue({
      name: h.name,
      birthDate: dayjs(h.birthDate),
      color: h.color,
      genderEnum: h.genderEnum,
      image: fileList,
    });

    setEditVisible(true);
  };

  // ====================== HELPERS ===========================
  const getImageUrlFromFileList = (fileList: UploadFile[]): string => {
    const f = fileList[0];
    return f?.response?.secure_url || f?.url || "";
  };

  // ====================== ADD HAMSTER ===========================
  const handleAddFinish = async (values: any) => {
    const fileList: UploadFile[] = values.image || [];
    let imageUrl = "";
    setLoading(true);
    try {
      if (fileList.length > 0) {
        const rawFile = fileList[0].originFileObj as File;

        imageUrl = await uploadToCloudinary(rawFile);
      }

      const payload = {
        name: values.name,
        birthDate: values.birthDate.toISOString(),
        color: values.color,
        genderEnum: values.genderEnum,
        imageUrl,
      };

      const res = await api.post("/hamsters", payload);
      if (res.data.code === 200) {
        toast.success(res.data.message);
        setAddVisible(false);
        fetchHamsters();
      }
    } catch (error) {
      toast.error("Tạo hamster thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ====================== UPDATE HAMSTER ===========================
  const handleEditFinish = async (values: any) => {
    if (!editingHamster) return;

    const imageUrl = values.image?.length ? getImageUrlFromFileList(values.image) : editingHamster.imageUrl;

    const payload = {
      name: values.name,
      birthDate: values.birthDate.toISOString(),
      color: values.color,
      genderEnum: values.genderEnum,
      imageUrl,
    };

    try {
      const res = await api.put(`/hamsters/${editingHamster.id}`, payload);
      if (res.data.code === 200) {
        message.success("Cập nhật thành công");
        setEditVisible(false);
        fetchHamsters();
      }
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const formatDate = (d: string) => dayjs(d).format("DD/MM/YYYY");

  // ====================== UI ===========================
  return (
    <div className="HamsterPage">
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <h2>Hamster của bạn</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Thêm mới Hamster
        </Button>
      </Row>

      {loading ? (
        <Spin />
      ) : hamsters.length === 0 ? (
        <Empty description="Chưa có hamster nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {hamsters.map((h) => (
            <Col xs={24} sm={12} md={8} lg={6} key={h.id}>
              <Card
                hoverable
                cover={<img src={h.imageUrl} alt={h.name} style={{ height: 180, objectFit: "cover" }} />}
                actions={[
                  <Button type="text" onClick={() => openEditModal(h)} key="edit">
                    Sửa
                  </Button>,
                  <Button
                    type="text"
                    key="detail"
                    onClick={() =>
                      Modal.info({
                        title: h.name,
                        content: (
                          <div className="HamsterDetail">
                            <p>
                              <span>ID:</span> {h.id}
                            </p>
                            <p>
                              <span>Ngày sinh:</span> {formatDate(h.birthDate)}
                            </p>
                            <p>
                              <span>Màu:</span> {h.color}
                            </p>
                            <p>
                              <span>Giới tính:</span> {h.genderEnum === "MALE" ? "Đực" : "Cái"}
                            </p>
                          </div>
                        ),
                      })
                    }
                  >
                    Chi tiết
                  </Button>,
                ]}
              >
                <h3 className="HamsterName">{h.name}</h3>

                <div className="HamsterInfo">
                  <div className="info-row">
                    <span className="label">ID:</span>
                    <span className="value">{h.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ngày sinh:</span>
                    <span className="value">{formatDate(h.birthDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Màu:</span>
                    <span className="value">{h.color}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Giới tính:</span>
                    <span className="value">{h.genderEnum === "MALE" ? "Đực" : "Cái"}</span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ====================== ADD MODAL =========================== */}
      <Modal title="Thêm hamster" open={addVisible} onCancel={() => setAddVisible(false)} footer={null}>
        <Form form={addForm} layout="vertical" onFinish={handleAddFinish}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="birthDate" label="Ngày sinh" rules={[{ required: true }]}>
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) => current && current >= dayjs().startOf("day")}
            />
          </Form.Item>

          <Form.Item name="color" label="Màu" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="genderEnum" label="Giới tính" rules={[{ required: true }]}>
            <Select>
              <Option value="FEMALE">Cái</Option>
              <Option value="MALE">Đực</Option>
            </Select>
          </Form.Item>

          <Form.Item name="image" label="Ảnh" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
            <Upload
              listType="picture"
              maxCount={1}
              accept="image/*"
              // BỎ customRequest và beforeUpload ở đây
              beforeUpload={() => false} // Vẫn giữ beforeUpload để ngăn upload tự động của Antd
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Tạo
          </Button>
        </Form>
      </Modal>

      {/* ====================== EDIT MODAL =========================== */}
      <Modal title="Chỉnh sửa hamster" open={editVisible} onCancel={() => setEditVisible(false)} footer={null}>
        <Form form={editForm} layout="vertical" onFinish={handleEditFinish}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="birthDate" label="Ngày sinh" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="color" label="Màu" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="genderEnum" label="Giới tính" rules={[{ required: true }]}>
            <Select>
              <Option value="FEMALE">Cái</Option>
              <Option value="MALE">Đực</Option>
            </Select>
          </Form.Item>

          <Form.Item name="image" label="Ảnh" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
            <Upload
              listType="picture"
              maxCount={1}
              accept="image/*"
              customRequest={handleUpload}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Lưu
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
