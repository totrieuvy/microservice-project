import React, { useEffect, useState } from "react";
import api from "../../../config/axios";
import { Table, Button, Modal, Form, Select, Tag, Input } from "antd";
import { toast } from "react-toastify";
import "../single-services/ManageSingleServices.scss"; // Tái sử dụng file SCSS cũ

const { Option } = Select;
const { Search } = Input;

// ======================= TYPES =======================
interface Account {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "STAFF";
  isActive: boolean;
}

// ======================= COMPONENT =======================
export default function ManageAccount() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [displayed, setDisplayed] = useState<Account[]>([]);

  // States cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [form] = Form.useForm();

  // Filters
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // ======================= API CALL =======================
  const fetchAccounts = async () => {
    try {
      const res = await api.get<{ data: Account[] }>("/auth/accounts");
      // Dữ liệu trả về có dạng { code, message, data: [...] }
      setAccounts(res.data.data);
      setDisplayed(res.data.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách tài khoản");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // ======================= FILTERING =======================
  useEffect(() => {
    let list = [...accounts];

    if (searchText) {
      const lower = searchText.toLowerCase();
      list = list.filter((acc) => acc.name.toLowerCase().includes(lower) || acc.email.toLowerCase().includes(lower));
    }

    if (roleFilter) {
      list = list.filter((acc) => acc.role === roleFilter);
    }

    setDisplayed(list);
  }, [searchText, roleFilter, accounts]);

  // ======================= HANDLE UPDATE ROLE =======================
  const handleOpenModal = (user: Account) => {
    setSelectedUser(user);
    form.setFieldsValue({ role: user.role });
    setIsModalOpen(true);
  };

  const handleUpdateRole = async (values: any) => {
    if (!selectedUser) return;

    try {
      // Gọi API Backend: PUT /api/auth/users/{id}/role?role=NEW_ROLE
      await api.put(`/auth/users/${selectedUser.id}/role`, null, {
        params: { role: values.role },
      });

      toast.success(`Đã cập nhật role cho ${selectedUser.email}`);
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchAccounts(); // Load lại data
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật role");
    }
  };

  // ======================= COLUMNS =======================
  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "name",
      key: "name",
      width: "25%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "30%",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      align: "center" as const,
      width: "15%",
      render: (role: string) => {
        let color = "geekblue";
        if (role === "ADMIN") color = "volcano";
        if (role === "STAFF") color = "green";
        return (
          <Tag color={color} key={role}>
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center" as const,
      width: "15%",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "error"}>{isActive ? "Active" : "Inactive"}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      render: (_: any, record: Account) => (
        <Button className="btn-orange" size="small" onClick={() => handleOpenModal(record)}>
          Đổi Role
        </Button>
      ),
    },
  ];

  return (
    <div className="service-page">
      {" "}
      {/* Sử dụng lại class cũ */}
      <h2>Quản lý tài khoản</h2>
      {/* Filters */}
      <div className="filters">
        <Search
          placeholder="Tìm theo tên hoặc email..."
          allowClear
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Select placeholder="Lọc theo Role" style={{ width: 200 }} allowClear onChange={(val) => setRoleFilter(val)}>
          <Option value="USER">USER</Option>
          <Option value="STAFF">STAFF</Option>
          <Option value="ADMIN">ADMIN</Option>
        </Select>
      </div>
      {/* Table */}
      <Table
        rowKey="id" // Dùng ID làm key
        columns={columns}
        dataSource={displayed}
        pagination={{ pageSize: 8 }}
      />
      {/* Modal Change Role */}
      <Modal
        title="Cập nhật quyền hạn (Role)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <p>
          Đang thay đổi quyền cho tài khoản: <b>{selectedUser?.email}</b>
        </p>
        <Form form={form} layout="vertical" onFinish={handleUpdateRole} initialValues={{ role: selectedUser?.role }}>
          <Form.Item name="role" label="Chọn Role mới" rules={[{ required: true, message: "Vui lòng chọn Role!" }]}>
            <Select>
              <Option value="USER">USER</Option>
              <Option value="STAFF">STAFF</Option>
              <Option value="ADMIN">ADMIN</Option>
            </Select>
          </Form.Item>

          <div className="modal-btns">
            <Button className="btn-gray" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button className="btn-blue" htmlType="submit">
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
