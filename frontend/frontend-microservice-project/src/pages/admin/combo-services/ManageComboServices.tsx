import React, { useEffect, useState } from "react";
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
  Space,
  Upload,
  Tag,
} from "antd";

import { UploadOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile, UploadRequestOption } from "antd/es/upload";

import dayjs from "dayjs";
import { toast } from "react-toastify";

import "./ManageComboServices.scss";

const CLOUDINARY_CLOUD_NAME = "duikwluky";
const CLOUDINARY_UPLOAD_PRESET = "hamster_unsigned";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const { Search } = Input;
const { Option } = Select;

interface SingleService {
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

interface ComboService {
  id: number;
  serviceName: string;
  finalPrice: number;
  children: SingleService[];
  discount: number | null;
  basePrice: number | null;
  image: string;
}

export default function ManageComboServices() {
  const navigate = useNavigate();

  const size = 8;

  const [page, setPage] = useState<number>(1);
  const [allCombos, setAllCombos] = useState<ComboService[]>([]);
  const [displayed, setDisplayed] = useState<ComboService[]>([]);

  const [singleServices, setSingleServices] = useState<SingleService[]>([]);

  const [searchText, setSearchText] = useState<string>("");
  const [sortPrice, setSortPrice] = useState<string>("");

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

  const handleUpload = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    try {
      const url = await uploadToCloudinary(file as RcFile);
      onSuccess?.({ secure_url: url }, new XMLHttpRequest());
    } catch (err) {
      onError?.(err as Error);
      toast.error("Upload ảnh thất bại!");
    }
  };

  // ======================= LOAD COMBOS =======================
  const fetchCombos = async () => {
    try {
      const res = await api.get<{ data: ComboService[] }>("/services/combos");
      setAllCombos(res.data.data);
    } catch {
      toast.error("Lỗi tải dữ liệu combo");
    }
  };

  // ======================= LOAD SINGLE SERVICES =======================
  const fetchSingleServices = async () => {
    try {
      const res = await api.get<{ data: SingleService[] }>("/services");
      setSingleServices(res.data.data.filter((s) => s.isActive));
    } catch {
      toast.error("Lỗi tải dịch vụ đơn");
    }
  };

  useEffect(() => {
    fetchCombos();
    fetchSingleServices();
  }, []);

  // ======================= FILTER + SORT + PAGINATE FE =======================
  useEffect(() => {
    let list = [...allCombos];

    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter((x) => x.serviceName.toLowerCase().includes(s));
    }

    if (sortPrice === "asc") {
      list.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sortPrice === "desc") {
      list.sort((a, b) => b.finalPrice - a.finalPrice);
    }

    const start = (page - 1) * size;
    const end = start + size;

    setDisplayed(list.slice(start, end));
  }, [allCombos, searchText, sortPrice, page]);

  // ======================= CREATE / UPDATE =======================
  const handleSubmit = async (values: any) => {
    try {
      const fileList: UploadFile[] = values.image || [];
      const imageUrl = fileList[0]?.response?.secure_url || fileList[0]?.url || "";

      const payload = {
        serviceName: values.serviceName,
        description: values.description,
        imageUrl,
        childServiceIds: values.childServiceIds,
        discount: Number(values.discount),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      if (editMode && editingId) {
        await api.put(`/services/combos/${editingId}`, payload);
        toast.success("Cập nhật combo thành công");
      } else {
        await api.post("/services/combos", payload);
        toast.success("Tạo combo thành công");
      }

      form.resetFields();
      setOpen(false);
      setEditMode(false);
      setEditingId(null);
      fetchCombos();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    }
  };

  // ======================= EDIT =======================
  const handleEdit = async (id: number) => {
    try {
      const res = await api.get<{ data: ComboService }>(`/services/combos/${id}`);
      const data = res.data.data;

      form.setFieldsValue({
        serviceName: data.serviceName,
        description: data.children.map((c) => c.serviceName).join(", "),
        discount: data.discount,
        childServiceIds: data.children.map((c) => c.id),
        startDate: data.children[0]?.startDate ? dayjs(data.children[0].startDate) : null,
        endDate: data.children[0]?.endDate ? dayjs(data.children[0].endDate) : null,
        image: data.image
          ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: data.image,
              } as UploadFile,
            ]
          : [],
      });

      setEditingId(id);
      setEditMode(true);
      setOpen(true);
    } catch {
      toast.error("Lỗi tải dữ liệu");
    }
  };

  // ======================= DELETE =======================
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa combo này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/services/combos/${id}`);
          toast.success("Xóa combo thành công");
          fetchCombos();
        } catch {
          toast.error("Lỗi xóa combo");
        }
      },
    });
  };

  // ======================= TABLE COLUMNS =======================
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (url: string) => <img src={url} className="service-thumb" alt="combo" />,
      align: "center" as const,
    },
    { title: "Tên combo", dataIndex: "serviceName", align: "center" as const },
    {
      title: "Dịch vụ con",
      dataIndex: "children",
      align: "center" as const,
      render: (children: SingleService[]) => (
        <div>
          {children.map((c) => (
            <Tag key={c.id} color="blue">
              {c.serviceName}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      align: "center" as const,
      render: (v: number | null) => (v ? `${v}%` : "-"),
    },
    {
      title: "Giá đang bán",
      dataIndex: "finalPrice",
      align: "center" as const,
      render: (v: number) => <strong>{v.toLocaleString("vi-VN")}₫</strong>,
    },
    {
      title: "Hành động",
      align: "center" as const,
      render: (_: any, r: ComboService) => (
        <Space>
          <Button className="btn-green" onClick={() => navigate(`/admin/combos/${r.id}`)}>
            Chi tiết
          </Button>
          <Button className="btn-orange" onClick={() => handleEdit(r.id)}>
            Cập nhật
          </Button>
          <Button className="btn-red" onClick={() => handleDelete(r.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="combo-page">
      <h2>Quản lý Combo Grooming</h2>

      {/* Filters */}
      <div className="filters">
        <Search
          placeholder="Tìm combo..."
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

        <Button className="btn-blue" onClick={() => setOpen(true)}>
          + Thêm combo
        </Button>
      </div>

      {/* Table */}
      <Table rowKey="id" columns={columns} dataSource={displayed} pagination={false} />

      {/* FE Pagination */}
      <div className="pagination-box">
        <Pagination current={page} pageSize={size} total={allCombos.length} onChange={(p) => setPage(p)} />
      </div>

      {/* Modal */}
      <Modal
        title={editMode ? "Cập nhật combo" : "Thêm combo mới"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditMode(false);
          setEditingId(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={600}
        className="combo-modal"
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="serviceName" label="Tên combo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="childServiceIds" label="Chọn dịch vụ" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Chọn các dịch vụ trong combo">
              {singleServices.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.serviceName} - {s.basePrice.toLocaleString("vi-VN")}₫
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="discount" label="Giảm giá (%)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} max={100} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="image"
            label="Ảnh combo"
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
