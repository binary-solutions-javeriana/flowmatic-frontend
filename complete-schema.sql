-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Course (
  CourseID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  Platform character varying,
  PlatformCode character varying,
  CourseName character varying,
  StartDate date,
  EndDate date,
  CONSTRAINT Course_pkey PRIMARY KEY (CourseID)
);
CREATE TABLE public.Document (
  DocumentID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  ProjectID integer NOT NULL,
  NameDocument character varying,
  Description text,
  URLStorage character varying,
  CONSTRAINT Document_pkey PRIMARY KEY (DocumentID),
  CONSTRAINT fk_Document_Project FOREIGN KEY (ProjectID) REFERENCES public.Project(ProjectID)
);
CREATE TABLE public.DocumentVersion (
  DocumentVersionID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  DocumentID integer NOT NULL,
  VersionNumber integer,
  URLStorage character varying,
  CONSTRAINT DocumentVersion_pkey PRIMARY KEY (DocumentVersionID),
  CONSTRAINT fk_DocumentVersion_Document FOREIGN KEY (DocumentID) REFERENCES public.Document(DocumentID)
);
CREATE TABLE public.Message (
  MessageID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  Body text,
  SenderUserID integer NOT NULL,
  ReceiveUserID integer NOT NULL,
  CONSTRAINT Message_pkey PRIMARY KEY (MessageID),
  CONSTRAINT fk_Message_SenderUser FOREIGN KEY (SenderUserID) REFERENCES public.User(UserID),
  CONSTRAINT fk_Message_ReceiveUser FOREIGN KEY (ReceiveUserID) REFERENCES public.User(UserID)
);
CREATE TABLE public.Methodology (
  MethodologyID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  Name character varying NOT NULL UNIQUE,
  CONSTRAINT Methodology_pkey PRIMARY KEY (MethodologyID)
);
CREATE TABLE public.Payment (
  PaymentID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  Status USER-DEFINED NOT NULL,
  PaymentType character varying,
  Service character varying,
  PaymentDate timestamp without time zone,
  Total numeric,
  CONSTRAINT Payment_pkey PRIMARY KEY (PaymentID)
);
CREATE TABLE public.Project (
  ProjectID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  NameProject character varying,
  Description text,
  Mail text,
  Start_date date,
  End_date date,
  State character varying,
  MethodologyID integer,
  TenantID integer,
  CONSTRAINT Project_pkey PRIMARY KEY (ProjectID),
  CONSTRAINT fk_Project_Methodology FOREIGN KEY (MethodologyID) REFERENCES public.Methodology(MethodologyID),
  CONSTRAINT Project_TenantID_fkey FOREIGN KEY (TenantID) REFERENCES public.Tenant(TenantID)
);
CREATE TABLE public.RoleCatalog (
  RoleID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  MethodologyID integer NOT NULL,
  Name character varying NOT NULL,
  Description text,
  CONSTRAINT RoleCatalog_pkey PRIMARY KEY (RoleID),
  CONSTRAINT fk_RoleCatalog_Methodology FOREIGN KEY (MethodologyID) REFERENCES public.Methodology(MethodologyID)
);
CREATE TABLE public.Task (
  TaskID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  ProjectID integer NOT NULL,
  Title character varying,
  Description text,
  Priority text,
  State USER-DEFINED NOT NULL,
  CreatedBy integer,
  LimitDate date,
  CONSTRAINT Task_pkey PRIMARY KEY (TaskID),
  CONSTRAINT fk_Task_Project FOREIGN KEY (ProjectID) REFERENCES public.Project(ProjectID),
  CONSTRAINT fk_Task_CreatedBy_User FOREIGN KEY (CreatedBy) REFERENCES public.User(UserID)
);
CREATE TABLE public.TaskAssignee (
  TaskID integer NOT NULL,
  UserID integer NOT NULL,
  CONSTRAINT TaskAssignee_pkey PRIMARY KEY (TaskID, UserID),
  CONSTRAINT fk_TaskAssignee_Task FOREIGN KEY (TaskID) REFERENCES public.Task(TaskID),
  CONSTRAINT fk_TaskAssignee_User FOREIGN KEY (UserID) REFERENCES public.User(UserID)
);
CREATE TABLE public.Tenant (
  TenantID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  UniversityName character varying,
  CreatedAt date,
  UpdatedAt date,
  CONSTRAINT Tenant_pkey PRIMARY KEY (TenantID)
);
CREATE TABLE public.TenantAdmin (
  TenantAdminID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  Name text,
  Email text,
  Password text,
  CreatedAt text,
  TenantID integer,
  CONSTRAINT TenantAdmin_pkey PRIMARY KEY (TenantAdminID),
  CONSTRAINT TenantAdmin_TenantID_fkey FOREIGN KEY (TenantID) REFERENCES public.Tenant(TenantID)
);
CREATE TABLE public.TenantXPayments (
  TenantID integer NOT NULL,
  PaymentID integer NOT NULL,
  CONSTRAINT TenantXPayments_pkey PRIMARY KEY (TenantID, PaymentID),
  CONSTRAINT fk_UserXPayments_Payment FOREIGN KEY (PaymentID) REFERENCES public.Payment(PaymentID),
  CONSTRAINT TenantXPayments_TenantID_fkey FOREIGN KEY (TenantID) REFERENCES public.Tenant(TenantID)
);
CREATE TABLE public.User (
  UserID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  Name character varying,
  Mail character varying,
  Rol USER-DEFINED NOT NULL,
  TenantID integer NOT NULL,
  Password text NOT NULL DEFAULT 'password'::text,
  CONSTRAINT User_pkey PRIMARY KEY (UserID),
  CONSTRAINT fk_User_Tenant FOREIGN KEY (TenantID) REFERENCES public.Tenant(TenantID)
);
CREATE TABLE public.UserXCourse (
  CourseID integer NOT NULL,
  UserID integer NOT NULL,
  CONSTRAINT UserXCourse_pkey PRIMARY KEY (CourseID, UserID),
  CONSTRAINT fk_UserXCourse_Course FOREIGN KEY (CourseID) REFERENCES public.Course(CourseID),
  CONSTRAINT fk_UserXCourse_User FOREIGN KEY (UserID) REFERENCES public.User(UserID)
);
CREATE TABLE public.UserXProject (
  UserID integer NOT NULL,
  ProjectID integer NOT NULL,
  RoleID integer NOT NULL,
  CONSTRAINT UserXProject_pkey PRIMARY KEY (UserID, ProjectID),
  CONSTRAINT fk_UserXProject_User FOREIGN KEY (UserID) REFERENCES public.User(UserID),
  CONSTRAINT fk_UserXProject_Project FOREIGN KEY (ProjectID) REFERENCES public.Project(ProjectID),
  CONSTRAINT fk_UserXProject_RoleCatalog FOREIGN KEY (RoleID) REFERENCES public.RoleCatalog(RoleID)
);
CREATE TABLE public.log_project (
  id_notification integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  IDProject integer,
  type USER-DEFINED NOT NULL,
  description text,
  CONSTRAINT log_project_pkey PRIMARY KEY (id_notification),
  CONSTRAINT fk_log_project_Project FOREIGN KEY (IDProject) REFERENCES public.Project(ProjectID)
);
CREATE TABLE public.log_task (
  id_notification integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  TaskID integer,
  type USER-DEFINED NOT NULL,
  description text,
  CONSTRAINT log_task_pkey PRIMARY KEY (id_notification),
  CONSTRAINT fk_log_task_Task FOREIGN KEY (TaskID) REFERENCES public.Task(TaskID)
);