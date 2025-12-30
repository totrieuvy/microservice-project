// ======================= NEW MANAGE SINGLE SERVICES (NO BE PAGINATION) =======================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";

import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Pagination,
  Switch,
  Space,
  Upload,
} from "antd";
import type { UploadProps } from "antd";

import { UploadOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile } from "antd/es/upload";

import dayjs from "dayjs";
import { toast } from "react-toastify";

import "./ManageSingleServices.scss";

const CLOUDINARY_CLOUD_NAME = "duikwluky";
const CLOUDINARY_UPLOAD_PRESET = "hamster_unsigned";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const { Search } = Input;
const { Option } = Select;

interface Service {
  id: number;
  serviceName: string;
  type: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function ManageSingleServices() {
  const navigate = useNavigate();

  const size = 8;

  const [page, setPage] = useState<number>(1);
  const [allServices, setAllServices] = useState<Service[]>([]);

  const [searchText, setSearchText] = useState<string>("");
  const [sortPrice, setSortPrice] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("");

  const [open, setOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // ======================= CLOUDINARY UPLOAD =======================
  const uploadToCloudinary = async (file: RcFile): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.secure_url;
  };

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      const url = await uploadToCloudinary(file as RcFile);
      onSuccess?.({ secure_url: url });
    } catch (err) {
      onError?.(err as Error);
      toast.error("Upload ảnh thất bại!");
    }
  };

  // useRealtime((body) => {
  //   console.log("Received WebSocket message:", body);
  // });

  // ======================= LOAD ALL SERVICES =======================
  const fetchServices = useCallback(async () => {
    try {
      const res = await api.get<{ data: Service[] }>("/services"); // ← YOU MUST CREATE THIS BE ENDPOINT
      setAllServices(res.data.data);
    } catch {
      toast.error("Lỗi tải dữ liệu");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();
  }, [fetchServices]);

  // ======================= FILTER + SORT + PAGINATE FE =======================
  const displayed = useMemo(() => {
    let list = [...allServices];

    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter((x) => x.serviceName.toLowerCase().includes(s));
    }

    if (filterActive !== "") {
      list = list.filter((x) => x.isActive === (filterActive === "true"));
    }

    if (sortPrice === "asc") {
      list.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sortPrice === "desc") {
      list.sort((a, b) => b.finalPrice - a.finalPrice);
    }

    const start = (page - 1) * size;
    const end = start + size;

    return list.slice(start, end);
  }, [allServices, searchText, filterActive, sortPrice, page]);

  // ======================= TOGGLE ACTIVE =======================
  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/services/${currentStatus ? "false" : "true"}/${id}`);
      toast.success("Cập nhật trạng thái thành công");
      fetchServices();
    } catch {
      toast.error("Lỗi cập nhật");
    }
  };

  // ======================= CREATE =======================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    try {
      const fileList: UploadFile[] = values.image || [];
      const imageUrl = fileList[0]?.response?.secure_url || fileList[0]?.url || "";

      const payload = {
        serviceName: values.serviceName,
        basePrice: Number(values.basePrice),
        discount: Number(values.discount),
        description: values.description,
        imageUrl,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      if (editMode && editingId) {
        await api.put(`/services/${editingId}`, payload);
        toast.success("Cập nhật thành công");
      } else {
        await api.post("/services", payload);
        toast.success("Tạo thành công");
      }

      form.resetFields();
      setOpen(false);
      setEditMode(false);
      setEditingId(null);
      fetchServices();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    }
  };

  // ======================= EDIT =======================
  const handleEdit = async (id: number) => {
    try {
      const res = await api.get<{ data: Service }>(`/services/${id}`);
      const data = res.data.data;

      form.setFieldsValue({
        serviceName: data.serviceName,
        basePrice: data.basePrice,
        discount: data.discount,
        description: data.description,
        startDate: dayjs(data.startDate),
        endDate: dayjs(data.endDate),
        image: data.imageUrl
          ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: data.imageUrl,
              } as UploadFile,
            ]
          : [],
      });

      setEditingId(id);
      setEditMode(true);
      setOpen(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Lỗi tải dữ liệu");
    }
  };

  // ======================= TABLE COLUMNS =======================
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      render: (url: string) => <img src={url} className="service-thumb" />,
      align: "center" as const,
    },
    { title: "Tên dịch vụ", dataIndex: "serviceName", align: "center" as const },
    { title: "Loại", dataIndex: "type", align: "center" as const },
    {
      title: "Giá cuối",
      dataIndex: "finalPrice",
      align: "center" as const,
      render: (v: number) => `${v.toLocaleString("vi-VN")}₫`,
    },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      align: "center" as const,
      render: (_: boolean, r: Service) => (
        <Switch checked={r.isActive} onChange={() => toggleActive(r.id, r.isActive)} />
      ),
    },
    {
      title: "Hành động",
      align: "center" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, r: Service) => (
        <Space>
          <Button className="btn-green" onClick={() => navigate(`/admin/services/${r.id}`)}>
            Chi tiết
          </Button>
          <Button className="btn-orange" onClick={() => handleEdit(r.id)}>
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="service-page">
      <h2>Quản lý dịch vụ Grooming</h2>

      {/* Filters */}
      <div className="filters">
        <Search
          placeholder="Tìm dịch vụ..."
          allowClear
          value={searchText}
          onChange={(e) => {
            setPage(1);
            setSearchText(e.target.value);
          }}
        />

        <Select value={sortPrice} onChange={setSortPrice} style={{ width: 150 }}>
          <Option value="">Sắp xếp giá</Option>
          <Option value="asc">Tăng dần</Option>
          <Option value="desc">Giảm dần</Option>
        </Select>

        <Select value={filterActive} onChange={setFilterActive} style={{ width: 180 }}>
          <Option value="">Trạng thái</Option>
          <Option value="true">Đang hoạt động</Option>
          <Option value="false">Không hoạt động</Option>
        </Select>

        <Button className="btn-blue" onClick={() => setOpen(true)}>
          + Thêm dịch vụ
        </Button>
      </div>

      {/* Table */}
      <Table rowKey="id" columns={columns} dataSource={displayed} pagination={false} />

      {/* FE Pagination */}
      <div className="pagination-box">
        <Pagination current={page} pageSize={size} total={allServices.length} onChange={(p) => setPage(p)} />
      </div>

      {/* Modal */}
      <Modal
        title={editMode ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditMode(false);
          setEditingId(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="serviceName" label="Tên dịch vụ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="basePrice" label="Giá gốc" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item name="discount" label="Giảm giá (%)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} max={100} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="image"
            label="Ảnh dịch vụ"
            rules={[{ required: true }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload maxCount={1} listType="picture-card" customRequest={handleUpload}>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </Upload>
          </Form.Item>

          <Form.Item name="startDate" label="Bắt đầu" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="endDate" label="Kết thúc" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <div className="modal-btns">
            <Button className="btn-gray" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button className="btn-blue" htmlType="submit">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
