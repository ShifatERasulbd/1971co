-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 17, 2026 at 12:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `1971co`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_giving_back_sections`
--

CREATE TABLE `about_giving_back_sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `section_title` varchar(255) NOT NULL DEFAULT 'Giving Back',
  `title` varchar(255) NOT NULL DEFAULT 'Roots Run Deep.',
  `description` text DEFAULT NULL,
  `points` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`points`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `about_giving_back_sections`
--

INSERT INTO `about_giving_back_sections` (`id`, `image`, `section_title`, `title`, `description`, `points`, `created_at`, `updated_at`) VALUES
(1, 'uploads/about/giving-back/1781586266_about_giving_back_6a30d95a8dd5c4.14738819.webp', 'Giving Back', 'Roots Run Deep.', 'Every 1971Co garment is crafted in Bangladesh-the birthplace of our heritage and the heart of our production. But our commitment goes beyond manufacturing.\r\n\r\nWe actively support community centers across Bangladesh, providing resources for education, skills training, and youth development programs. These centers serve as hubs for local communities, offering opportunities for growth and empowerment.\r\n\r\nWhen you wear 1971Co, you are not just wearing quality streetwear. You are supporting the communities that make our vision possible. Every purchase contributes to building stronger, more vibrant communities back home.', '[\"Education Programs\",\"Skills Training\",\"Youth Development\"]', '2026-06-15 23:03:40', '2026-06-15 23:04:26');

-- --------------------------------------------------------

--
-- Table structure for table `about_hero_sections`
--

CREATE TABLE `about_hero_sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `section_title` varchar(255) NOT NULL DEFAULT 'Our Story',
  `title` varchar(255) NOT NULL DEFAULT 'Heritage. Culture. Style.',
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `about_hero_sections`
--

INSERT INTO `about_hero_sections` (`id`, `background_image`, `section_title`, `title`, `description`, `created_at`, `updated_at`) VALUES
(1, 'uploads/about/hero/1781527310_about_hero_6a2ff30ec4c0d8.12870098.jpg', 'Our', 'Heritage.', 'Redefining streetwear through bold design and authentic self-', '2026-06-15 06:40:48', '2026-06-15 06:41:50');

-- --------------------------------------------------------

--
-- Table structure for table `about_mission_sections`
--

CREATE TABLE `about_mission_sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Our Mission',
  `description` text DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `about_mission_sections`
--

INSERT INTO `about_mission_sections` (`id`, `background_image`, `title`, `description`, `items`, `created_at`, `updated_at`) VALUES
(1, 'uploads/about/mission/1781585355_about_mission_6a30d5cb0eab87.68288187.jpg', 'Our Mission', 'Our mission is to make personalized fashion accessible, premium, and expressive. We aim to deliver apparel that combines comfort, durability, and modern design while giving customers the freedom to create styles that represent their identity.', '[{\"icon\":\"BadgeCheck\",\"title\":\"Premium-Quality\"},{\"icon\":\"SlidersHorizontal\",\"title\":\"Creative Customization\"},{\"icon\":\"Gift\",\"title\":\"Long-Term Partnerships\"},{\"icon\":\"Handshake\",\"title\":\"Modern Fashion Designed\"}]', '2026-06-15 07:13:49', '2026-06-15 22:49:15');

-- --------------------------------------------------------

--
-- Table structure for table `about_story_sections`
--

CREATE TABLE `about_story_sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `section_title` varchar(255) NOT NULL DEFAULT 'The Beginning',
  `title` varchar(255) NOT NULL DEFAULT 'Why 1971?',
  `description_html` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `about_story_sections`
--

INSERT INTO `about_story_sections` (`id`, `background_image`, `section_title`, `title`, `description_html`, `created_at`, `updated_at`) VALUES
(1, 'uploads/about/story/1781528584_about_story_6a2ff8086e82f3.63671374.webp', 'The Beginning', 'Why us?', '<p>\"1971\" carries deep historical significance representing independence, pride, and cultural identity. It signals that our brand is rooted in Bangladeshi legacy, not copying Western streetwear but redefining its own path.</p><p>The \"Co\" brings a fresh, youthful street vibe clean, approachable, and contemporary. Together, they represent our mission: heritage meets modern street culture.</p><p>At 1971Co, we believe streetwear is more than clothing. It\'s a statement of identity and confidence. Our designs combine bold aesthetics, urban culture influences, and high-quality craftsmanship to help individuals express themselves fearlessly.</p>', '2026-06-15 06:49:50', '2026-06-15 07:03:04');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-356a192b7913b04c54574d18c28d46e6395428ab', 'i:1;', 1781676776),
('laravel-cache-356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1781676776;', 1781676776),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1781678022),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1781678022;', 1781678022),
('laravel-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0', 'i:1;', 1781676812),
('laravel-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0:timer', 'i:1781676812;', 1781676812);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `show_homepage` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `show_homepage`, `created_at`, `updated_at`) VALUES
(1, 'New Arrivals', 'new-arrivals', 1, '2026-06-06 23:42:02', '2026-06-13 04:28:21'),
(6, 'Best Sellers', 'best-sellers', 1, '2026-06-13 04:37:15', '2026-06-13 04:37:15'),
(7, 'Shop', 'shop', 1, '2026-06-13 04:37:32', '2026-06-13 04:37:42');

-- --------------------------------------------------------

--
-- Table structure for table `checkout_orders`
--

CREATE TABLE `checkout_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `items_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `shipping` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `checkout_orders`
--

INSERT INTO `checkout_orders` (`id`, `user_id`, `order_number`, `first_name`, `last_name`, `email`, `phone`, `address_line_1`, `address_line_2`, `city`, `state`, `postal_code`, `country`, `notes`, `items_count`, `subtotal`, `shipping`, `total`, `items`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, 'ORD-20260616121546-9721', 'Shifat E', 'Rasul', 'shifaterasulbd@gmail.com', '+8801871769835', '51,Arjotpara,Mohakhali Dhaka', NULL, 'Dhaka', 'Dhaka', '1215', 'Bangladesh', NULL, 1, 28.99, 0.00, 28.99, '[{\"lineId\":\"59::Bright White::S\",\"productId\":\"59\",\"name\":\"Sweatshirt\",\"priceValue\":28.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260616065950-vvIU9Lr6TX.jpg\",\"selectedColor\":\"Bright White\",\"selectedSize\":\"S\"}]', 'processing', '2026-06-16 06:15:46', '2026-06-17 00:12:45'),
(2, 1, 'ORD-20260617110818-5548', 'Shifat E', 'Rasul', 'shifaterasulbd@gmail.com', '+8801871769835', '51,Arjotpara,Mohakhali Dhaka', NULL, 'Dhaka', 'Dhaka', '1215', 'Bangladesh', NULL, 2, 57.98, 0.00, 57.98, '[{\"lineId\":\"59::Bright White::S\",\"productId\":\"59\",\"name\":\"Sweatshirt\",\"priceValue\":28.99,\"quantity\":2,\"image\":\"\\/uploads\\/products\\/gallery\\/20260616065950-vvIU9Lr6TX.jpg\",\"selectedColor\":\"Bright White\",\"selectedSize\":\"S\"}]', 'pending', '2026-06-17 05:08:18', '2026-06-17 05:08:18');

-- --------------------------------------------------------

--
-- Table structure for table `collection_items`
--

CREATE TABLE `collection_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `collection_section_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image` text DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `collection_items`
--

INSERT INTO `collection_items` (`id`, `collection_section_id`, `name`, `slug`, `image`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'New Arrivals', 'new-arrivals', 'data:image/webp;base64,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', 1, '2026-06-13 23:06:56', '2026-06-14 00:40:20');
INSERT INTO `collection_items` (`id`, `collection_section_id`, `name`, `slug`, `image`, `sort_order`, `created_at`, `updated_at`) VALUES
(2, 1, 'Essentials', 'essentials', 'data:image/webp;base64,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', 2, '2026-06-13 23:06:56', '2026-06-14 04:22:44'),
(3, 1, 'Tees', 'tees', '/uploads/heroes/images/hero1.webp', 0, '2026-06-13 23:06:56', '2026-06-14 04:22:44'),
(4, 1, 'Bottoms', 'bottoms', '/uploads/heroes/images/hero1.webp', 3, '2026-06-13 23:06:56', '2026-06-13 23:06:56');

-- --------------------------------------------------------

--
-- Table structure for table `collection_sections`
--

CREATE TABLE `collection_sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Collections',
  `title_position` varchar(20) NOT NULL DEFAULT 'left',
  `items_per_view` tinyint(3) UNSIGNED NOT NULL DEFAULT 4,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `collection_sections`
--

INSERT INTO `collection_sections` (`id`, `title`, `title_position`, `items_per_view`, `created_at`, `updated_at`) VALUES
(1, 'Collections', 'left', 4, '2026-06-13 23:06:56', '2026-06-16 23:50:39');

-- --------------------------------------------------------

--
-- Table structure for table `colors`
--

CREATE TABLE `colors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `color_code` varchar(7) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `colors`
--

INSERT INTO `colors` (`id`, `name`, `color_code`, `created_at`, `updated_at`) VALUES
(1, 'Bright White', '#F4F5F0', '2026-06-14 02:04:23', '2026-06-15 14:23:59'),
(2, 'Black Beauty', '#27272A', '2026-06-14 02:04:54', '2026-06-15 14:24:36'),
(3, 'Mountain Blue', '#6D9192', '2026-06-14 02:05:32', '2026-06-15 14:23:21'),
(4, 'Taupe', '#BFAF9C', '2026-06-14 02:06:04', '2026-06-14 02:06:04'),
(5, 'Army Green', '#53665C', '2026-06-14 02:07:03', '2026-06-15 14:22:31'),
(6, 'Retro Red', '#CD212A', '2026-06-14 02:09:54', '2026-06-15 14:22:00'),
(8, 'Navy', '#363B48', '2026-06-14 02:10:54', '2026-06-15 14:22:56'),
(9, 'Arona', '#879BA3', '2026-06-15 14:25:11', '2026-06-15 14:25:11'),
(10, 'Mocha Meringue', '#9F8D81', '2026-06-15 14:25:43', '2026-06-15 14:25:43');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `features`
--

CREATE TABLE `features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `short_description` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `sort_order` smallint(5) UNSIGNED DEFAULT NULL,
  `columns_per_view` tinyint(3) UNSIGNED DEFAULT NULL,
  `title_font_size` smallint(5) UNSIGNED DEFAULT NULL,
  `title_font_family` varchar(100) DEFAULT NULL,
  `description_font_size` smallint(5) UNSIGNED DEFAULT NULL,
  `description_font_family` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `features`
--

INSERT INTO `features` (`id`, `title`, `short_description`, `description`, `icon`, `sort_order`, `columns_per_view`, `title_font_size`, `title_font_family`, `description_font_size`, `description_font_family`, `created_at`, `updated_at`) VALUES
(1, 'Premium Materials', 'Quality fabrics built to last', 'Quality fabrics built to last', 'fearures/icons/1781418835_feature_icon_6a2e4b53cf23f2.75491120.svg', 0, 3, 26, 'instrument-sans', 16, 'instrument-sans', '2026-06-08 04:23:31', '2026-06-14 00:41:13'),
(2, 'Made for Daily Wear', 'Essentials you\'ll reach for every day', 'Essentials you\'ll reach for every day', 'fearures/icons/1781419342_feature_icon_6a2e4d4ef102d6.39507511.svg', 1, 3, 26, 'instrument-sans', 16, 'instrument-sans', '2026-06-08 04:23:32', '2026-06-14 00:42:22'),
(3, 'Clean, Urban Fit', 'Modern silhouettes, timeless style', 'Modern silhouettes, timeless style', 'fearures/icons/1781419343_feature_icon_6a2e4d4fa8ab65.94527822.svg', 2, 3, 26, 'instrument-sans', 16, 'instrument-sans', '2026-06-08 04:23:32', '2026-06-14 00:42:23'),
(4, 'Hassle-Free Global Returns', 'Shop with confidence with easy returns worldwide.', 'Shop with confidence with easy returns worldwide.', NULL, 3, 3, 26, 'instrument-sans', 16, 'instrument-sans', '2026-06-08 04:23:33', '2026-06-14 00:33:57');

-- --------------------------------------------------------

--
-- Table structure for table `grand_childs`
--

CREATE TABLE `grand_childs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `child_id` bigint(20) UNSIGNED NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `soft_deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grand_childs`
--

INSERT INTO `grand_childs` (`id`, `name`, `child_id`, `slug`, `category_id`, `soft_deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'T-Shirt', 1, 't-shirt', 7, NULL, '2026-06-13 22:21:15', '2026-06-13 22:21:25'),
(2, 'Polo Shirt', 1, 'polo-shirt', 7, NULL, '2026-06-13 22:21:43', '2026-06-13 22:21:43'),
(3, 'Tank Tops', 1, 'tank-tops', 7, NULL, '2026-06-13 22:22:05', '2026-06-13 22:22:05'),
(4, 'Under Shirt', 1, 'under-shirt', 7, NULL, '2026-06-13 22:22:23', '2026-06-13 22:22:23'),
(5, 'Hoodies & Sweat Shirt', 1, 'hoodies-sweat-shirt', 7, NULL, '2026-06-13 22:22:47', '2026-06-13 22:22:47'),
(6, 'Sweat Jackets', 1, 'sweat-jackets', 7, NULL, '2026-06-13 22:23:01', '2026-06-13 22:23:01'),
(7, 'Vest', 1, 'vest', 7, NULL, '2026-06-13 22:23:12', '2026-06-13 22:23:12'),
(8, 'Shorts', 2, 'shorts', 7, NULL, '2026-06-13 22:23:30', '2026-06-13 22:23:30'),
(9, 'Joggers', 2, 'joggers', 7, NULL, '2026-06-13 22:23:40', '2026-06-13 22:23:40'),
(10, 'Undershirt Bundle', 3, 'undershirt-bundle', 7, NULL, '2026-06-13 22:24:09', '2026-06-13 22:24:09'),
(11, 'Shorts Bundle', 3, 'shorts-bundle', 7, NULL, '2026-06-13 22:24:23', '2026-06-13 22:24:23'),
(12, 'Tank Top Bundles', 3, 'tank-top-bundles', 7, NULL, '2026-06-13 22:24:37', '2026-06-13 22:24:37');

-- --------------------------------------------------------

--
-- Table structure for table `heroes`
--

CREATE TABLE `heroes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `title_display_mode` varchar(20) DEFAULT NULL,
  `title_font_size` smallint(5) UNSIGNED DEFAULT NULL,
  `title_font_family` varchar(100) DEFAULT NULL,
  `description_font_size` smallint(5) UNSIGNED DEFAULT NULL,
  `description_font_family` varchar(100) DEFAULT NULL,
  `text_offset_x` smallint(6) DEFAULT NULL,
  `text_offset_y` smallint(6) DEFAULT NULL,
  `title_offset_x` smallint(6) DEFAULT NULL,
  `title_offset_y` smallint(6) DEFAULT NULL,
  `description_offset_x` smallint(6) DEFAULT NULL,
  `description_offset_y` smallint(6) DEFAULT NULL,
  `button_offset_x` smallint(6) DEFAULT NULL,
  `button_offset_y` smallint(6) DEFAULT NULL,
  `button_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `button_url` varchar(2048) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `video` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `heroes`
--

INSERT INTO `heroes` (`id`, `title`, `description`, `title_display_mode`, `title_font_size`, `title_font_family`, `description_font_size`, `description_font_family`, `text_offset_x`, `text_offset_y`, `title_offset_x`, `title_offset_y`, `description_offset_x`, `description_offset_y`, `button_offset_x`, `button_offset_y`, `button_enabled`, `button_url`, `image`, `video`, `created_at`, `updated_at`) VALUES
(2, 'QUIETLY BOLD Casualware', 'Essentials built for repeat wear. Clean lines. Premium feel', 'double', 124, 'instrument-sans', 24, 'instrument-sans', 0, 0, 0, 0, 0, 0, 0, 0, 1, '/shop', '/uploads/heroes/images/hero1.webp', 'http://localhost:8000/uploads/heroes/videos/1781344008_video.mp4', '2026-06-08 03:29:49', '2026-06-16 07:11:36');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_04_24_082423_create_personal_access_tokens_table', 1),
(5, '2026_05_21_044729_create_heroes_table', 2),
(6, '2026_05_12_095558_create_personalizations_table', 3),
(7, '2026_05_13_120000_add_order_fields_to_personalizations_table', 4),
(8, '2026_06_06_000001_create_products_table', 5),
(9, '2026_04_25_230000_create_roles_and_permissions_tables', 6),
(10, '2026_06_06_100000_add_variant_fields_to_products_table', 7),
(11, '2026_06_06_101500_convert_products_size_to_string', 8),
(12, '2026_06_06_120500_add_stock_to_products_table', 9),
(13, '2026_06_07_053000_add_missing_product_detail_columns', 10),
(14, '2026_06_07_053100_add_category_columns_to_products_table', 11),
(15, '2026_05_16_104625_create_categories_table', 12),
(16, '2026_05_17_045124_update_category_add_show_homepage', 13),
(17, '2026_05_16_114820_create_sub_categories_table', 14),
(18, '2026_05_12_052310_create_heroes_table', 15),
(19, '2026_05_16_050207_create_features_table', 15),
(20, '2026_06_07_071000_add_typography_fields_to_heroes_table', 16),
(21, '2026_06_08_000100_add_position_fields_to_heroes_table', 17),
(22, '2026_06_08_000200_add_button_fields_to_heroes_table', 18),
(23, '2026_06_08_000300_add_title_display_mode_to_heroes_table', 19),
(24, '2026_06_08_000400_add_builder_fields_to_features_table', 20),
(25, '2026_06_14_120000_create_collection_sections_table', 21),
(26, '2026_06_14_120100_create_collection_items_table', 22),
(27, '2026_06_14_130000_add_short_description_to_features_table', 23),
(28, '2026_06_14_140000_add_columns_per_view_to_features_table', 24),
(29, '2026_06_14_130000_create_our_story_sections_table', 25),
(30, '2026_06_14_071317_create_sizes_table', 26),
(31, '2026_06_14_120000_create_colors_table', 27),
(32, '2026_06_14_130000_add_image_gallery_to_products_table', 28),
(33, '2026_06_14_170000_add_variant_json_columns_to_products_table', 29),
(34, '2026_06_14_110613_create_settings_table', 30),
(35, '2026_06_14_190000_add_show_on_best_sellers_to_products_table', 31),
(36, '2026_06_15_120000_add_grand_child_id_to_products_table', 32),
(37, '2026_06_15_000000_create_about_hero_sections_table', 33),
(38, '2026_06_15_000001_create_about_story_sections_table', 34),
(39, '2026_06_15_000002_create_about_mission_sections_table', 35),
(40, '2026_06_16_000003_add_background_image_to_about_mission_sections_table', 36),
(41, '2026_06_16_000004_create_about_giving_back_sections_table', 37),
(42, '2026_06_16_220000_create_checkout_orders_table', 38),
(43, '2026_06_16_230500_add_customer_fields_to_users_table', 39),
(44, '2026_06_16_231000_add_user_id_to_checkout_orders_table', 40),
(45, '2026_06_17_140000_add_product_content_fields_to_products_table', 41),
(46, '2026_06_17_150000_add_product_composition_to_products_table', 42);

-- --------------------------------------------------------

--
-- Table structure for table `our_story_sections`
--

CREATE TABLE `our_story_sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `story_image` text DEFAULT NULL,
  `story_logo` text DEFAULT NULL,
  `section_title` varchar(255) NOT NULL DEFAULT 'Our Story',
  `title` varchar(255) NOT NULL DEFAULT 'Heritage, Refined.',
  `description` text DEFAULT NULL,
  `background_color` varchar(20) NOT NULL DEFAULT '#c8b89a',
  `show_image` tinyint(1) NOT NULL DEFAULT 1,
  `show_text` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `our_story_sections`
--

INSERT INTO `our_story_sections` (`id`, `story_image`, `story_logo`, `section_title`, `title`, `description`, `background_color`, `show_image`, `show_text`, `created_at`, `updated_at`) VALUES
(1, 'uploads/our-story/images/1781584475_story_image_6a30d25bc69ac5.59079252.webp', '/uploads/our-story/logos/1781420389_story_logo_6a2e5165ca4800.54520075.avif', 'Our Story', 'Heritage, Refined.', '1971Co blends cultural identity with modern streetwear discipline - built to feel confident without shouting. Our pieces are designed for those who value restraint over noise, quality over quantity.', '#c8b89a', 1, 1, '2026-06-14 00:56:21', '2026-06-15 22:34:35');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'View Dashboard', 'view-dashboard', '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(2, 'Manage Countries', 'manage-countries', '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(3, 'Manage States', 'manage-states', '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(4, 'Manage Warehouses', 'manage-warehouses', '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(5, 'Manage Users', 'manage-users', '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(6, 'Manage Roles', 'manage-roles', '2026-06-06 03:32:51', '2026-06-06 03:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `permission_role`
--

CREATE TABLE `permission_role` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission_role`
--

INSERT INTO `permission_role` (`id`, `permission_id`, `role_id`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(2, 6, 1, '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(3, 3, 1, '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(4, 5, 1, '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(5, 4, 1, '2026-06-06 03:32:51', '2026-06-06 03:32:51'),
(6, 1, 1, '2026-06-06 03:32:51', '2026-06-06 03:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `personalizations`
--

CREATE TABLE `personalizations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  `front_image_path` varchar(255) DEFAULT NULL,
  `back_image_path` varchar(255) DEFAULT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `order_status` varchar(50) NOT NULL DEFAULT 'pending',
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `color` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`color`)),
  `size` varchar(191) DEFAULT NULL,
  `available_products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`available_products`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `show_on_best_sellers` tinyint(1) NOT NULL DEFAULT 0,
  `cover_image` varchar(255) DEFAULT NULL,
  `size_chart_image` varchar(255) DEFAULT NULL,
  `image_gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`image_gallery`)),
  `variant_rows` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variant_rows`)),
  `color_variant_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`color_variant_images`)),
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subcategory_id` bigint(20) UNSIGNED DEFAULT NULL,
  `grand_child_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text DEFAULT NULL,
  `fit` longtext DEFAULT NULL,
  `fabric_and_care` longtext DEFAULT NULL,
  `product_features` longtext DEFAULT NULL,
  `product_composition` longtext DEFAULT NULL,
  `long_description` longtext DEFAULT NULL,
  `additional_information` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `sku`, `barcode`, `color`, `size`, `available_products`, `created_at`, `updated_at`, `price`, `stock`, `show_on_best_sellers`, `cover_image`, `size_chart_image`, `image_gallery`, `variant_rows`, `color_variant_images`, `category_id`, `subcategory_id`, `grand_child_id`, `description`, `fit`, `fabric_and_care`, `product_features`, `product_composition`, `long_description`, `additional_information`) VALUES
(48, 'Classic Tank Tops for Men\'s', 'classic-tank-tops-for-men-s', 'TANT-M', NULL, '\"Mountain Blue, Black Beauty, Bright White, gray\"', 'L, M, S, XL, XXL', NULL, '2026-06-15 16:16:55', '2026-06-17 01:11:34', 15.99, 100, 1, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260615122513-L6oZNsJsmL.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-uvsFswBNPn.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-0YZmwrZfv4.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-CJfyyVcB7t.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-0dvVuRzVgh.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-qyOJsyUKUI.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-wOuv70eLH4.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-ibRUYdEGFm.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-itwAKcZ7Cj.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-kBL9jPOWj3.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-f213IDkokd.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-jwY0D357BU.jpg\"]', '[{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"TANT-M-MOUNTAIN-BLUE-L\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"TANT-M-MOUNTAIN-BLUE-M\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"TANT-M-MOUNTAIN-BLUE-S\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"TANT-M-MOUNTAIN-BLUE-XL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"TANT-M-MOUNTAIN-BLUE-XXL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"TANT-M-BLACK-BEAUTY-L\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"TANT-M-BLACK-BEAUTY-M\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"TANT-M-BLACK-BEAUTY-S\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"TANT-M-BLACK-BEAUTY-XL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"TANT-M-BLACK-BEAUTY-XXL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"TANT-M-BRIGHT-WHITE-L\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"TANT-M-BRIGHT-WHITE-M\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"TANT-M-BRIGHT-WHITE-S\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"TANT-M-BRIGHT-WHITE-XL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"TANT-M-BRIGHT-WHITE-XXL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"gray__L\",\"color\":\"gray\",\"size\":\"L\",\"sku\":\"TANT-M-GRAY-L\",\"stock\":100,\"price\":\"15.99\"},{\"key\":\"gray__M\",\"color\":\"gray\",\"size\":\"M\",\"sku\":\"TANT-M-GRAY-M\",\"stock\":100,\"price\":\"15.99\"},{\"key\":\"gray__S\",\"color\":\"gray\",\"size\":\"S\",\"sku\":\"TANT-M-GRAY-S\",\"stock\":100,\"price\":\"15.99\"},{\"key\":\"gray__XL\",\"color\":\"gray\",\"size\":\"XL\",\"sku\":\"TANT-M-GRAY-XL\",\"stock\":100,\"price\":\"15.99\"},{\"key\":\"gray__XXL\",\"color\":\"gray\",\"size\":\"XXL\",\"sku\":\"TANT-M-GRAY-XXL\",\"stock\":100,\"price\":\"15.99\"}]', '{\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260615122513-L6oZNsJsmL.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-uvsFswBNPn.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-kBL9jPOWj3.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260615122513-0YZmwrZfv4.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-CJfyyVcB7t.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-f213IDkokd.jpg\"],\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260615122513-wOuv70eLH4.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-ibRUYdEGFm.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-jwY0D357BU.jpg\"],\"gray\":[\"\\/uploads\\/products\\/gallery\\/20260615122513-0dvVuRzVgh.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-qyOJsyUKUI.jpg\",\"\\/uploads\\/products\\/gallery\\/20260615122513-itwAKcZ7Cj.jpg\"]}', 7, 1, 3, 'Sleek and versatile, our Men\'s Tank Tops in Classic Fit deliver comfort for everyday wear. Crafted from breathable fabric, these tanks feature a timeless silhouette that works seamlessly under shirts or as a standalone piece. The relaxed yet tailored fit flatters without clinging, making them perfect for layering or warm-weather styling. Durable construction ensures they\'ll remain a wardrobe staple season after season. Available in essential colors to match any outfit.', NULL, NULL, NULL, NULL, '<p>A classic tank top made from lightweight, breathable fabric with moisture-wicking performance. Designed for active wear, offering comfort, airflow, and freedom of movement.</p>', '<p>A classic tank top made from lightweight, breathable fabric with moisture-wicking performance. Designed for active wear, offering comfort, airflow, and freedom of movement.</p>'),
(49, 'Athletic Shorts', 'athletic-shorts', '1971-ASH-002', NULL, '\"gray, Black Beauty, Mountain Blue, Bright White\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 08:49:33', '2026-06-17 01:11:54', 15.99, 100, 0, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616044933-0WcF52DAFn.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-VyO5GodmM9.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-jcYcD2nOcP.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-aFYwUDnNFQ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-VGAfmS9k1n.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-aoP2uMhozL.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-5ZwoV61OfU.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-tvUVdbGkeh.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-qIstJ1nKg8.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-eSLAMpQqdD.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-EW6laWyXgf.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-egwzoHl7qY.jpg\"]', '[{\"key\":\"gray__L\",\"color\":\"gray\",\"size\":\"L\",\"sku\":\"1971-ASH-002 -GRAY-L\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"gray__M\",\"color\":\"gray\",\"size\":\"M\",\"sku\":\"1971-ASH-002 -GRAY-M\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"gray__S\",\"color\":\"gray\",\"size\":\"S\",\"sku\":\"1971-ASH-002 -GRAY-S\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"gray__XL\",\"color\":\"gray\",\"size\":\"XL\",\"sku\":\"1971-ASH-002 -GRAY-XL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"gray__XXL\",\"color\":\"gray\",\"size\":\"XXL\",\"sku\":\"1971-ASH-002 -GRAY-XXL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-ASH-002 -BLACK-BEAUTY-L\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-ASH-002 -BLACK-BEAUTY-M\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-ASH-002 -BLACK-BEAUTY-S\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-ASH-002 -BLACK-BEAUTY-XL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-ASH-002 -BLACK-BEAUTY-XXL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-ASH-002 -MOUNTAIN-BLUE-L\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-ASH-002 -MOUNTAIN-BLUE-M\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-ASH-002 -MOUNTAIN-BLUE-S\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-ASH-002 -MOUNTAIN-BLUE-XL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-ASH-002 -MOUNTAIN-BLUE-XXL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-ASH-002 -BRIGHT-WHITE-L\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-ASH-002 -BRIGHT-WHITE-M\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-ASH-002 -BRIGHT-WHITE-S\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-ASH-002 -BRIGHT-WHITE-XL\",\"stock\":\"100\",\"price\":\"15.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-ASH-002 -BRIGHT-WHITE-XXL\",\"stock\":\"100\",\"price\":\"15.99\"}]', '{\"gray\":[\"\\/uploads\\/products\\/gallery\\/20260616044933-5ZwoV61OfU.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-tvUVdbGkeh.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-qIstJ1nKg8.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616044933-eSLAMpQqdD.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-EW6laWyXgf.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-egwzoHl7qY.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616044933-aFYwUDnNFQ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-VGAfmS9k1n.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-aoP2uMhozL.jpg\"],\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616044933-0WcF52DAFn.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-VyO5GodmM9.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616044933-jcYcD2nOcP.jpg\"]}', 7, 2, 8, 'Elevate your workout wardrobe with our Athletic Shorts. Each pair features breathable fabric, a secure fit, and functional pockets to keep you moving. Whether you\'re hitting the gym, running outdoors, or training hard, you\'ll have the perfect shorts on hand. Perfect for athletes who demand quality and variety without breaking the bank. Stock up and save with this complete bundle.', NULL, NULL, NULL, NULL, '<p>Classic-fit athletic shorts made from lightweight polyester fabric. Designed for comfort in and out of water, featuring an elastic waistband, adjustable drawstring, and functional side pockets.</p>', '<p>Machine wash cold with similar colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if needed.</p>'),
(50, 'MEN\'S PUFFER VEST', 'men-s-puffer-vest', '1971-VEST-001', NULL, '\"Mocha Meringue, Navy, Mountain Blue, Orange\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 08:59:24', '2026-06-17 01:12:19', 44.99, 100, 1, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616045924-HLKOJE4mYK.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-CROCQyjeIH.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-iH0mqKBXM5.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-vKTxntChpv.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-M6lEI4Stdd.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-yfpYawMW4R.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-pWmTsItgdc.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-clVAlb6I9f.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-axnFhojddf.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-XWFkw2e9aJ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-9p1iulf87S.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-woOdc9LSBX.jpg\"]', '[{\"key\":\"Mocha Meringue__L\",\"color\":\"Mocha Meringue\",\"size\":\"L\",\"sku\":\"1971-VEST-001-MOCHA-MERINGUE-L\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mocha Meringue__M\",\"color\":\"Mocha Meringue\",\"size\":\"M\",\"sku\":\"1971-VEST-001-MOCHA-MERINGUE-M\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mocha Meringue__S\",\"color\":\"Mocha Meringue\",\"size\":\"S\",\"sku\":\"1971-VEST-001-MOCHA-MERINGUE-S\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mocha Meringue__XL\",\"color\":\"Mocha Meringue\",\"size\":\"XL\",\"sku\":\"1971-VEST-001-MOCHA-MERINGUE-XL\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mocha Meringue__XXL\",\"color\":\"Mocha Meringue\",\"size\":\"XXL\",\"sku\":\"1971-VEST-001-MOCHA-MERINGUE-XXL\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Navy__L\",\"color\":\"Navy\",\"size\":\"L\",\"sku\":\"1971-VEST-001-NAVY-L\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Navy__M\",\"color\":\"Navy\",\"size\":\"M\",\"sku\":\"1971-VEST-001-NAVY-M\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Navy__S\",\"color\":\"Navy\",\"size\":\"S\",\"sku\":\"1971-VEST-001-NAVY-S\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Navy__XL\",\"color\":\"Navy\",\"size\":\"XL\",\"sku\":\"1971-VEST-001-NAVY-XL\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Navy__XXL\",\"color\":\"Navy\",\"size\":\"XXL\",\"sku\":\"1971-VEST-001-NAVY-XXL\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-VEST-001-MOUNTAIN-BLUE-L\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-VEST-001-MOUNTAIN-BLUE-M\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-VEST-001-MOUNTAIN-BLUE-S\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-VEST-001-MOUNTAIN-BLUE-XL\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-VEST-001-MOUNTAIN-BLUE-XXL\",\"stock\":\"100\",\"price\":\"44.99\"},{\"key\":\"Orange__L\",\"color\":\"Orange\",\"size\":\"L\",\"sku\":\"1971-VEST-001-ORANGE-L\",\"stock\":100,\"price\":\"44.99\"},{\"key\":\"Orange__M\",\"color\":\"Orange\",\"size\":\"M\",\"sku\":\"1971-VEST-001-ORANGE-M\",\"stock\":100,\"price\":\"44.99\"},{\"key\":\"Orange__S\",\"color\":\"Orange\",\"size\":\"S\",\"sku\":\"1971-VEST-001-ORANGE-S\",\"stock\":100,\"price\":\"44.99\"},{\"key\":\"Orange__XL\",\"color\":\"Orange\",\"size\":\"XL\",\"sku\":\"1971-VEST-001-ORANGE-XL\",\"stock\":100,\"price\":\"44.99\"},{\"key\":\"Orange__XXL\",\"color\":\"Orange\",\"size\":\"XXL\",\"sku\":\"1971-VEST-001-ORANGE-XXL\",\"stock\":100,\"price\":\"44.99\"}]', '{\"Mocha Meringue\":[\"\\/uploads\\/products\\/gallery\\/20260616045924-vKTxntChpv.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-M6lEI4Stdd.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-yfpYawMW4R.jpg\"],\"Navy\":[\"\\/uploads\\/products\\/gallery\\/20260616045924-XWFkw2e9aJ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-9p1iulf87S.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-woOdc9LSBX.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616045924-iH0mqKBXM5.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-clVAlb6I9f.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-axnFhojddf.jpg\"],\"Orange\":[\"\\/uploads\\/products\\/gallery\\/20260616045924-HLKOJE4mYK.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-CROCQyjeIH.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616045924-pWmTsItgdc.jpg\"]}', 7, 1, 7, 'Stay warm and stylish with this classic men\'s puffer vest. Designed for versatility, it layers effortlessly over any shirt or sweater for added insulation without bulk. The classic fit provides comfortable movement, while the lightweight construction makes it perfect for transitional weather or layering year-round. Durable outer shell and premium quilted padding deliver reliable warmth and durability. An essential piece for any modern wardrobe.', NULL, NULL, NULL, NULL, '<p>A lightweight puffer vest designed for warmth without bulk. Made from durable recycled fabric with insulated padding, featuring a full-zip front and secure side pockets for everyday functionality.</p>', '<p>Machine wash at 20°C. Do not use biological detergents. Do not bleach. Do not tumble dry. Do not iron. Do not dry clean. Wash dark colors separately.</p>'),
(51, 'MENS Regular JOGGER', 'mens-regular-jogger', '1971-JGR-001', NULL, '\"Bright White, Black Beauty, Mountain Blue, Taupe\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 09:24:48', '2026-06-17 01:12:31', 32.99, 100, 0, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616052448-VbCQPc1o1C.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-CqsT1IT89x.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-HScooDvidQ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-jzdYK4qLEx.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-S7lWMJ8n0e.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-82f9l8ro0V.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-oIYxm7aGvS.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-3wyjkuSMsL.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-tmiH7HoxLH.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-GGbW9QUHAu.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-1VGFu9Czxo.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-Y0uITvbZX9.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-JGR-001-BRIGHT-WHITE-L\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-JGR-001-BRIGHT-WHITE-M\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-JGR-001-BRIGHT-WHITE-S\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-JGR-001-BRIGHT-WHITE-XL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-JGR-001-BRIGHT-WHITE-XXL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-JGR-001-BLACK-BEAUTY-L\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-JGR-001-BLACK-BEAUTY-M\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-JGR-001-BLACK-BEAUTY-S\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-JGR-001-BLACK-BEAUTY-XL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-JGR-001-BLACK-BEAUTY-XXL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-JGR-001-MOUNTAIN-BLUE-L\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-JGR-001-MOUNTAIN-BLUE-M\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-JGR-001-MOUNTAIN-BLUE-S\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-JGR-001-MOUNTAIN-BLUE-XL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-JGR-001-MOUNTAIN-BLUE-XXL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__L\",\"color\":\"Taupe\",\"size\":\"L\",\"sku\":\"1971-JGR-001-TAUPE-L\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__M\",\"color\":\"Taupe\",\"size\":\"M\",\"sku\":\"1971-JGR-001-TAUPE-M\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__S\",\"color\":\"Taupe\",\"size\":\"S\",\"sku\":\"1971-JGR-001-TAUPE-S\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__XL\",\"color\":\"Taupe\",\"size\":\"XL\",\"sku\":\"1971-JGR-001-TAUPE-XL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__XXL\",\"color\":\"Taupe\",\"size\":\"XXL\",\"sku\":\"1971-JGR-001-TAUPE-XXL\",\"stock\":\"1\",\"price\":\"32.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616052448-3wyjkuSMsL.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-tmiH7HoxLH.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-GGbW9QUHAu.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616052448-82f9l8ro0V.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-oIYxm7aGvS.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-Y0uITvbZX9.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616052448-VbCQPc1o1C.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-CqsT1IT89x.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-HScooDvidQ.jpg\"],\"Taupe\":[\"\\/uploads\\/products\\/gallery\\/20260616052448-jzdYK4qLEx.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-S7lWMJ8n0e.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616052448-1VGFu9Czxo.jpg\"]}', 7, 2, 9, 'Comfortable everyday joggers designed for the modern man. These regular-fit joggers feature a relaxed silhouette that works equally well for casual outings or lounging at home. Crafted with quality fabric that moves with you, they offer the perfect balance of style and comfort. Elastic waistband and tapered ankles provide a polished look without sacrificing ease of wear. An essential addition to any casual wardrobe.', NULL, NULL, NULL, NULL, '<p>Regular-fit joggers designed for comfort and movement. Made from soft fleece fabric with an elastic waistband, adjustable drawstring, and functional side pockets. Finished with ribbed cuffs for a tapered look.</p>', '<p>Machine wash cold with like colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if needed.</p>'),
(52, 'Sweat Jacket Full-Zip', 'sweat-jacket-full-zip', '1971-SWTJ-001', NULL, '\"Bright White, Mountain Blue, Taupe, Black Beauty\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 09:36:56', '2026-06-17 01:12:38', 34.93, 100, 1, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616053656-AD5U8Se6i0.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-FGx9FKNxIQ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-b2dpeDQ0YA.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-xKSq8LK0ha.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-1t1oN8GK8g.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-qBzjV9E7ay.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-3nD06Z3TJc.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-0H3Q758NCK.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-TftPTiuC2L.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-UXsbV4rEN3.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-NON4Zj5FFP.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-qQr3XDCqL9.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-SWTJ-001-BRIGHT-WHITE-L\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-SWTJ-001-BRIGHT-WHITE-M\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-SWTJ-001-BRIGHT-WHITE-S\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-SWTJ-001-BRIGHT-WHITE-XL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-SWTJ-001-BRIGHT-WHITE-XXL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-SWTJ-001-MOUNTAIN-BLUE-L\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-SWTJ-001-MOUNTAIN-BLUE-M\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-SWTJ-001-MOUNTAIN-BLUE-S\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-SWTJ-001-MOUNTAIN-BLUE-XL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-SWTJ-001-MOUNTAIN-BLUE-XXL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Taupe__L\",\"color\":\"Taupe\",\"size\":\"L\",\"sku\":\"1971-SWTJ-001-TAUPE-L\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Taupe__M\",\"color\":\"Taupe\",\"size\":\"M\",\"sku\":\"1971-SWTJ-001-TAUPE-M\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Taupe__S\",\"color\":\"Taupe\",\"size\":\"S\",\"sku\":\"1971-SWTJ-001-TAUPE-S\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Taupe__XL\",\"color\":\"Taupe\",\"size\":\"XL\",\"sku\":\"1971-SWTJ-001-TAUPE-XL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Taupe__XXL\",\"color\":\"Taupe\",\"size\":\"XXL\",\"sku\":\"1971-SWTJ-001-TAUPE-XXL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-SWTJ-001-BLACK-BEAUTY-L\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-SWTJ-001-BLACK-BEAUTY-M\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-SWTJ-001-BLACK-BEAUTY-S\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-SWTJ-001-BLACK-BEAUTY-XL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-SWTJ-001-BLACK-BEAUTY-XXL\",\"stock\":\"1\",\"price\":\"34.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616053656-AD5U8Se6i0.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-FGx9FKNxIQ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-b2dpeDQ0YA.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616053656-3nD06Z3TJc.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-0H3Q758NCK.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-TftPTiuC2L.jpg\"],\"Taupe\":[\"\\/uploads\\/products\\/gallery\\/20260616053656-xKSq8LK0ha.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-1t1oN8GK8g.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-qBzjV9E7ay.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616053656-UXsbV4rEN3.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-qQr3XDCqL9.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616053656-NON4Zj5FFP.jpg\"]}', 7, 1, 6, 'Elevate your casual wardrobe with this versatile sweat jacket. Designed with a full-zip closure for easy layering and temperature control, it features a comfortable regular fit that works for everyday wear. The soft, breathable fabric keeps you cozy without bulk, making it perfect for transitional seasons or relaxed weekends. A timeless essential that pairs effortlessly with jeans, joggers, or chinos.', NULL, NULL, NULL, NULL, '<p>A regular-fit full-zip jacket made from soft fleece fabric. Designed for everyday wear with front pockets, ribbed trims, and a full-length zipper for easy layering.</p>', '<p>Machine wash cold with similar colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if required.</p>'),
(53, 'Quarter-zip Jacket', 'quarter-zip-jacket', '1971-POVER-001', NULL, '\"Bright White, Mountain Blue, Black Beauty, Taupe\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 09:54:54', '2026-06-17 01:12:46', 34.99, 100, 0, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616055454-SlTWfgrius.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-FyTs2FTNDB.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-jQ8OhU5JPe.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-otfKEU02tJ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-39xXCXKVq6.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-he0MgaCneU.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-LBTrF9rorm.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-yccyC9vZrE.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-NkiVeXX0MT.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-A20itO82bt.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-MFpnpbUbsW.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-wVOYCKPyjK.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-POVER-001-BRIGHT-WHITE-L\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-POVER-001-BRIGHT-WHITE-M\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-POVER-001-BRIGHT-WHITE-S\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-POVER-001-BRIGHT-WHITE-XL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-POVER-001-BRIGHT-WHITE-XXL\",\"stock\":\"1\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-POVER-001-MOUNTAIN-BLUE-L\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-POVER-001-MOUNTAIN-BLUE-M\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-POVER-001-MOUNTAIN-BLUE-S\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-POVER-001-MOUNTAIN-BLUE-XL\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-POVER-001-MOUNTAIN-BLUE-XXL\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-POVER-001-BLACK-BEAUTY-L\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-POVER-001-BLACK-BEAUTY-M\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-POVER-001-BLACK-BEAUTY-S\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-POVER-001-BLACK-BEAUTY-XL\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-POVER-001-BLACK-BEAUTY-XXL\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Taupe__L\",\"color\":\"Taupe\",\"size\":\"L\",\"sku\":\"1971-POVER-001-TAUPE-L\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Taupe__M\",\"color\":\"Taupe\",\"size\":\"M\",\"sku\":\"1971-POVER-001-TAUPE-M\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Taupe__S\",\"color\":\"Taupe\",\"size\":\"S\",\"sku\":\"1971-POVER-001-TAUPE-S\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Taupe__XL\",\"color\":\"Taupe\",\"size\":\"XL\",\"sku\":\"1971-POVER-001-TAUPE-XL\",\"stock\":\"100\",\"price\":\"34.99\"},{\"key\":\"Taupe__XXL\",\"color\":\"Taupe\",\"size\":\"XXL\",\"sku\":\"1971-POVER-001-TAUPE-XXL\",\"stock\":\"100\",\"price\":\"34.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616055454-39xXCXKVq6.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-he0MgaCneU.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-LBTrF9rorm.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616055454-otfKEU02tJ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-MFpnpbUbsW.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-wVOYCKPyjK.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616055454-jQ8OhU5JPe.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-A20itO82bt.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-NkiVeXX0MT.jpg\"],\"Taupe\":[\"\\/uploads\\/products\\/gallery\\/20260616055454-SlTWfgrius.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-FyTs2FTNDB.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616055454-yccyC9vZrE.jpg\"]}', 7, 1, 6, 'Effortless layering meets everyday comfort with this quarter-zip jacket. The regular fit provides a relaxed silhouette that works over t-shirts or light sweaters, while the quarter-zip design offers easy ventilation and adjustable coverage. Durable construction and a timeless style make it a versatile wardrobe essential for casual outings, weekend adventures, or transitional weather. Perfect for those who value both function and understated style.', NULL, NULL, NULL, NULL, '<p>A regular-fit half-zip pullover designed for layering and comfort. Made from soft fleece fabric with a structured fit, featuring a front zipper and side pockets for functionality.</p>', '<p>Machine wash cold with like colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if needed.</p>'),
(54, 'Regular Kangaroo Pocket Hoodie', 'regular-kangaroo-pocket-hoodie', '1971-HDY-001', NULL, '\"Bright White, Mountain Blue, Taupe, Black Beauty\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 10:07:21', '2026-06-17 01:12:57', 32.99, 100, 1, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616060721-uVxlxkFBXT.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-hQ1fuLOEwA.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-99MxEoLfcO.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-xX9jYHvTDR.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-sdNyjcGcWM.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-OjT4K8ULwa.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-HBwccPF2Ks.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-ZdIBnESrE2.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-Gp09rhM9jk.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-HziNTs7P0K.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-cAh3vBX0FZ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-Uo5B5RJqW4.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-HDY-001-BRIGHT-WHITE-L\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-HDY-001-BRIGHT-WHITE-M\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-HDY-001-BRIGHT-WHITE-S\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-HDY-001-BRIGHT-WHITE-XL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-HDY-001-BRIGHT-WHITE-XXL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-HDY-001-MOUNTAIN-BLUE-L\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-HDY-001-MOUNTAIN-BLUE-M\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-HDY-001-MOUNTAIN-BLUE-S\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-HDY-001-MOUNTAIN-BLUE-XL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-HDY-001-MOUNTAIN-BLUE-XXL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__L\",\"color\":\"Taupe\",\"size\":\"L\",\"sku\":\"1971-HDY-001-TAUPE-L\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__M\",\"color\":\"Taupe\",\"size\":\"M\",\"sku\":\"1971-HDY-001-TAUPE-M\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__S\",\"color\":\"Taupe\",\"size\":\"S\",\"sku\":\"1971-HDY-001-TAUPE-S\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__XL\",\"color\":\"Taupe\",\"size\":\"XL\",\"sku\":\"1971-HDY-001-TAUPE-XL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Taupe__XXL\",\"color\":\"Taupe\",\"size\":\"XXL\",\"sku\":\"1971-HDY-001-TAUPE-XXL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-HDY-001-BLACK-BEAUTY-L\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-HDY-001-BLACK-BEAUTY-M\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-HDY-001-BLACK-BEAUTY-S\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-HDY-001-BLACK-BEAUTY-XL\",\"stock\":\"1\",\"price\":\"32.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-HDY-001-BLACK-BEAUTY-XXL\",\"stock\":\"1\",\"price\":\"32.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616060721-uVxlxkFBXT.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-hQ1fuLOEwA.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-99MxEoLfcO.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616060721-ZdIBnESrE2.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-cAh3vBX0FZ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-Uo5B5RJqW4.jpg\"],\"Taupe\":[\"\\/uploads\\/products\\/gallery\\/20260616060721-xX9jYHvTDR.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-sdNyjcGcWM.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-Gp09rhM9jk.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616060721-OjT4K8ULwa.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-HBwccPF2Ks.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616060721-HziNTs7P0K.jpg\"]}', 7, 1, 5, 'Comfortable everyday hoodie designed with a classic regular fit and spacious kangaroo pocket for convenient storage. Crafted from soft, durable fabric that moves with you, this versatile piece layers effortlessly over tees or stands alone as a casual essential. Perfect for relaxed days at home, outdoor adventures, or casual outings. The relaxed silhouette provides unrestricted movement while maintaining a polished, put-together look.', NULL, NULL, NULL, NULL, '<p>A regular-fit hoodie crafted from soft fleece fabric for warmth and comfort. Features a three-panel hood, kangaroo pocket, and ribbed trims for a structured yet relaxed fit.</p>', '<p>Machine wash cold with similar colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if necessary.</p>'),
(55, 'Classic Polo Shirt', 'classic-polo-shirt', '1971-POLO-001', NULL, '\"Bright White, Mountain Blue, Taupe, Black Beauty\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 10:21:59', '2026-06-17 03:57:18', 19.98, 100, 1, NULL, '/uploads/products/size-charts/20260617095718-QHsFPr0tdW.webp', '[\"\\/uploads\\/products\\/gallery\\/20260616062159-u8lLCKUN0o.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-8RKrzfS5WU.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-GTsEgQsQxe.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-cGXzXIjyQX.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-0I8f59dXRX.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-s0TybrEfYC.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-J6IrOeOBAk.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-UBSirls9IZ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-Ep9oBbwiw2.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-98RpYsWJM6.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-OOXtebejcc.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-mlYfeAWS2N.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-POLO-001-BRIGHT-WHITE-L\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-POLO-001-BRIGHT-WHITE-M\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-POLO-001-BRIGHT-WHITE-S\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-POLO-001-BRIGHT-WHITE-XL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-POLO-001-BRIGHT-WHITE-XXL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-POLO-001-MOUNTAIN-BLUE-L\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-POLO-001-MOUNTAIN-BLUE-M\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-POLO-001-MOUNTAIN-BLUE-S\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-POLO-001-MOUNTAIN-BLUE-XL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-POLO-001-MOUNTAIN-BLUE-XXL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__L\",\"color\":\"Taupe\",\"size\":\"L\",\"sku\":\"1971-POLO-001-TAUPE-L\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__M\",\"color\":\"Taupe\",\"size\":\"M\",\"sku\":\"1971-POLO-001-TAUPE-M\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__S\",\"color\":\"Taupe\",\"size\":\"S\",\"sku\":\"1971-POLO-001-TAUPE-S\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__XL\",\"color\":\"Taupe\",\"size\":\"XL\",\"sku\":\"1971-POLO-001-TAUPE-XL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__XXL\",\"color\":\"Taupe\",\"size\":\"XXL\",\"sku\":\"1971-POLO-001-TAUPE-XXL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-POLO-001-BLACK-BEAUTY-L\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-POLO-001-BLACK-BEAUTY-M\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-POLO-001-BLACK-BEAUTY-S\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-POLO-001-BLACK-BEAUTY-XL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-POLO-001-BLACK-BEAUTY-XXL\",\"stock\":\"1\",\"price\":\"19.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616062159-u8lLCKUN0o.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-8RKrzfS5WU.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-GTsEgQsQxe.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616062159-98RpYsWJM6.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-OOXtebejcc.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-mlYfeAWS2N.jpg\"],\"Taupe\":[\"\\/uploads\\/products\\/gallery\\/20260616062159-cGXzXIjyQX.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-s0TybrEfYC.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-0I8f59dXRX.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616062159-J6IrOeOBAk.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-UBSirls9IZ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616062159-Ep9oBbwiw2.jpg\"]}', 7, 1, 2, '1971co elegance meets everyday comfort in this classic polo shirt. Crafted from premium cotton blend fabric, it delivers a soft feel and reliable durability for work, weekend outings, or casual gatherings. The tailored classic fit flatters most body types while allowing freedom of movement. Features a clean collar, button placket, and versatile design that pairs effortlessly with jeans, chinos, or shorts. Available in essential colors that complement any wardrobe. Perfect for those who appreciate quality basics that never go out of style.', '<p>A classic-fit polo shirt crafted from breathable mesh fabric with moisture-wicking properties. Designed for both comfort and style, featuring a structured collar, button placket, and lightweight feel for everyday wear.</p>', '<p><em>Machine wash cold with similar colors.<br></em>Do not bleach.<br>*Tumble dry low. Remove promptly.<br>*Iron at medium temperature if needed.</p>', '<p>fadfasdfasd</p>', '<p>fadsfadsfadsfadfadsfad</p>', '<p>A classic-fit polo shirt crafted from breathable mesh fabric with moisture-wicking properties. Designed for both comfort and style, featuring a structured collar, button placket, and lightweight feel for everyday wear.</p>', '<p><em>Machine wash cold with similar colors.<br></em>Do not bleach.<br>*Tumble dry low. Remove promptly.<br>*Iron at medium temperature if needed.</p>');
INSERT INTO `products` (`id`, `name`, `slug`, `sku`, `barcode`, `color`, `size`, `available_products`, `created_at`, `updated_at`, `price`, `stock`, `show_on_best_sellers`, `cover_image`, `size_chart_image`, `image_gallery`, `variant_rows`, `color_variant_images`, `category_id`, `subcategory_id`, `grand_child_id`, `description`, `fit`, `fabric_and_care`, `product_features`, `product_composition`, `long_description`, `additional_information`) VALUES
(56, 'Regular T-Shirt', 'regular-t-shirt', '1971-TEE-002', NULL, '\"Bright White, Mountain Blue, Taupe, Black Beauty\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 10:48:27', '2026-06-17 01:13:14', 19.99, 100, 1, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616064827-GGrupOH4NI.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-MPy7pxjaDZ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-swWRVdTxI2.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-NUItmSCTZu.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-rPdNwPgBV4.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-ccOQxSft4S.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-0fvdEA7ozQ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-9uPMWvCYoP.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-HfJuNKVLU5.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-4rlFVBMDtA.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-9rYhorVeZ8.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-gy16Ngmm5Z.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-TEE-002-BRIGHT-WHITE-L\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-TEE-002-BRIGHT-WHITE-M\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-TEE-002-BRIGHT-WHITE-S\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-TEE-002-BRIGHT-WHITE-XL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-TEE-002-BRIGHT-WHITE-XXL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-TEE-002-MOUNTAIN-BLUE-L\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-TEE-002-MOUNTAIN-BLUE-M\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-TEE-002-MOUNTAIN-BLUE-S\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-TEE-002-MOUNTAIN-BLUE-XL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-TEE-002-MOUNTAIN-BLUE-XXL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__L\",\"color\":\"Taupe\",\"size\":\"L\",\"sku\":\"1971-TEE-002-TAUPE-L\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__M\",\"color\":\"Taupe\",\"size\":\"M\",\"sku\":\"1971-TEE-002-TAUPE-M\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__S\",\"color\":\"Taupe\",\"size\":\"S\",\"sku\":\"1971-TEE-002-TAUPE-S\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__XL\",\"color\":\"Taupe\",\"size\":\"XL\",\"sku\":\"1971-TEE-002-TAUPE-XL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Taupe__XXL\",\"color\":\"Taupe\",\"size\":\"XXL\",\"sku\":\"1971-TEE-002-TAUPE-XXL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-TEE-002-BLACK-BEAUTY-L\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-TEE-002-BLACK-BEAUTY-M\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-TEE-002-BLACK-BEAUTY-S\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-TEE-002-BLACK-BEAUTY-XL\",\"stock\":\"1\",\"price\":\"19.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-TEE-002-BLACK-BEAUTY-XXL\",\"stock\":\"1\",\"price\":\"19.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616064827-GGrupOH4NI.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-MPy7pxjaDZ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-swWRVdTxI2.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616064827-NUItmSCTZu.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-rPdNwPgBV4.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-ccOQxSft4S.jpg\"],\"Taupe\":[\"\\/uploads\\/products\\/gallery\\/20260616064827-0fvdEA7ozQ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-9uPMWvCYoP.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-HfJuNKVLU5.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616064827-4rlFVBMDtA.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-9rYhorVeZ8.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616064827-gy16Ngmm5Z.jpg\"]}', 7, 1, 1, 'Classic comfort meets everyday style with our Regular T-Shirt in a timeless regular fit. Crafted from soft, breathable fabric, this versatile essential works for casual outings, layering, or relaxed weekends. The straightforward cut ensures a comfortable, flattering silhouette for all body types. Perfect for building a wardrobe staple that pairs with anything in your closet.', NULL, NULL, NULL, NULL, '<p>A regular-fit t-shirt designed for everyday versatility. Made from soft, durable cotton with a comfortable structure. Features a classic silhouette, breathable fabric, and a clean finish suitable for casual or layered looks.</p>', '<p>Machine wash cold with similar colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if required.</p>'),
(57, 'Under shirt round neck', 'under-shirt-round-neck', '1971-TEE-001R', NULL, '\"Bright White\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 10:51:21', '2026-06-17 01:13:27', 9.99, 100, 0, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616065121-tE3is9eEIh.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065121-b0SRLjQ5cI.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065121-JHjiHgWtEj.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065121-ObaOUHrbTb.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065121-nhOc7PGQFA.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-TEE-001R-BRIGHT-WHITE-L\",\"stock\":\"100\",\"price\":\"9.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-TEE-001R-BRIGHT-WHITE-M\",\"stock\":\"100\",\"price\":\"9.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-TEE-001R-BRIGHT-WHITE-S\",\"stock\":\"100\",\"price\":\"9.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-TEE-001R-BRIGHT-WHITE-XL\",\"stock\":\"100\",\"price\":\"9.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-TEE-001R-BRIGHT-WHITE-XXL\",\"stock\":\"100\",\"price\":\"9.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616065121-tE3is9eEIh.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065121-b0SRLjQ5cI.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065121-JHjiHgWtEj.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065121-ObaOUHrbTb.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065121-nhOc7PGQFA.jpg\"]}', NULL, NULL, NULL, 'Lightweight undershirt designed for a sleek, tailored silhouette. The round neckline offers classic versatility, while the slim fit contours to your frame without restricting movement. Perfect as a base layer under shirts or worn solo for a minimalist look. Crafted for comfort and durability, this essential piece transitions seamlessly from everyday wear to layered styling.', NULL, NULL, NULL, NULL, '<p>A classic slim-fit undershirt with a round neckline, crafted for all-day comfort. Made from soft cotton with stretch, offering breathability and a smooth fit. Designed with a tag-free finish to prevent irritation and ensure long-lasting wear.</p>', '<p>Machine wash cold with like colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if needed.</p>'),
(58, 'Under shirt v neck', 'under-shirt-v-neck', '1971-TEE-001V', NULL, '\"Bright White\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 10:55:10', '2026-06-17 01:13:33', 9.99, 100, 0, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616065510-p9bWm9VnQM.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065510-AvExjrdfcb.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065510-S9Uja2YYpY.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065510-mX7dGrbtLt.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-TEE-001V-BRIGHT-WHITE-L\",\"stock\":\"100\",\"price\":\"9.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-TEE-001V-BRIGHT-WHITE-M\",\"stock\":\"100\",\"price\":\"9.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-TEE-001V-BRIGHT-WHITE-S\",\"stock\":\"100\",\"price\":\"9.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-TEE-001V-BRIGHT-WHITE-XL\",\"stock\":\"100\",\"price\":\"9.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-TEE-001V-BRIGHT-WHITE-XXL\",\"stock\":\"100\",\"price\":\"9.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616065510-p9bWm9VnQM.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065510-AvExjrdfcb.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065510-S9Uja2YYpY.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065510-mX7dGrbtLt.jpg\"]}', NULL, NULL, NULL, 'This slim-fit v-neck undershirt delivers everyday comfort without compromise. The streamlined cut hugs your frame while the soft fabric moves with you, making it perfect as a base layer or standalone piece. Crafted with attention to detail, it\'s versatile enough to wear under anything or showcase on its own. Choose a custom design to make it uniquely yours, or keep it classic and blank for endless styling possibilities.', NULL, NULL, NULL, NULL, '<p>A slim-fit V-neck undershirt designed for everyday comfort and layering. Made from soft, breathable cotton with added stretch for flexibility. Features a clean neckline, lightweight feel, and a heat seal label for irritation-free wear. Built to maintain shape and durability over time.</p>', '<p>Machine wash cold with like colors to maintain brightness and softness. Do not bleach. Remove promptly after washing to reduce wrinkles. Tumble dry on low heat and iron at medium temperature if needed.</p>'),
(59, 'Sweatshirt', 'sweatshirt', '1971-SWT-001', NULL, '\"Bright White, Mountain Blue, Taupe, Black Beauty\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 10:59:50', '2026-06-17 01:13:41', 28.99, 100, 1, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616065950-vvIU9Lr6TX.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-NONZ5irC1R.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-nyP7wyu37V.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-87e4LX3l2m.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-iRKnsHCM1S.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-pALPMK00aO.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-077SHw5ZL8.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-TbOnxpZNhJ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-v7fbbZFQkB.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-S1c0zJCmdj.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-moffy8RJua.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-KravqW38id.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-SWT-001-BRIGHT-WHITE-L\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-SWT-001-BRIGHT-WHITE-M\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-SWT-001-BRIGHT-WHITE-S\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-SWT-001-BRIGHT-WHITE-XL\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-SWT-001-BRIGHT-WHITE-XXL\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-SWT-001-MOUNTAIN-BLUE-L\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-SWT-001-MOUNTAIN-BLUE-M\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-SWT-001-MOUNTAIN-BLUE-S\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-SWT-001-MOUNTAIN-BLUE-XL\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-SWT-001-MOUNTAIN-BLUE-XXL\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Taupe__L\",\"color\":\"Taupe\",\"size\":\"L\",\"sku\":\"1971-SWT-001-TAUPE-L\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Taupe__M\",\"color\":\"Taupe\",\"size\":\"M\",\"sku\":\"1971-SWT-001-TAUPE-M\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Taupe__S\",\"color\":\"Taupe\",\"size\":\"S\",\"sku\":\"1971-SWT-001-TAUPE-S\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Taupe__XL\",\"color\":\"Taupe\",\"size\":\"XL\",\"sku\":\"1971-SWT-001-TAUPE-XL\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Taupe__XXL\",\"color\":\"Taupe\",\"size\":\"XXL\",\"sku\":\"1971-SWT-001-TAUPE-XXL\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-SWT-001-BLACK-BEAUTY-L\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-SWT-001-BLACK-BEAUTY-M\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-SWT-001-BLACK-BEAUTY-S\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-SWT-001-BLACK-BEAUTY-XL\",\"stock\":\"100\",\"price\":\"28.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-SWT-001-BLACK-BEAUTY-XXL\",\"stock\":\"100\",\"price\":\"28.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616065950-vvIU9Lr6TX.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-NONZ5irC1R.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-nyP7wyu37V.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616065950-077SHw5ZL8.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-TbOnxpZNhJ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-v7fbbZFQkB.jpg\"],\"Taupe\":[\"\\/uploads\\/products\\/gallery\\/20260616065950-S1c0zJCmdj.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-moffy8RJua.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-KravqW38id.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616065950-87e4LX3l2m.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-iRKnsHCM1S.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616065950-pALPMK00aO.jpg\"]}', NULL, NULL, NULL, 'Comfortable everyday sweatshirt designed for a relaxed, regular fit. Crafted from soft, durable fabric that moves with you through casual days and laid-back moments. Perfect for layering or wearing solo, this versatile piece pairs effortlessly with jeans, joggers, or shorts. A wardrobe essential that delivers warmth without the bulk.', NULL, NULL, NULL, NULL, '<p>A regular-fit sweatshirt made from soft fleece fabric with a brushed interior for added warmth. Designed for comfort with ribbed cuffs and hem, offering durability and a relaxed everyday fit.</p>', '<p>Machine wash cold with like colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if needed.</p>'),
(60, 'Athletic Shorts -5 Pcs Bundle', 'athletic-shorts-5-pcs-bundle', '1971-ASH-002 (5 PCS set)', NULL, '\"Bright White, Mountain Blue, gray, Black Beauty\"', 'L, M, S, XL, XXL', NULL, '2026-06-16 11:09:16', '2026-06-17 01:13:49', 59.99, 100, 0, NULL, NULL, '[\"\\/uploads\\/products\\/gallery\\/20260616072008-1zUPM02LSz.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-lyP0dja6CO.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-CVKY8K9PJT.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-GMe5ySUD9j.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-1BdlGWAgYW.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-M1cce3nGOD.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-SC1jZkSDK8.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-3zUySr1D9x.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-YoEstF4nLQ.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-cRqvT2IPWP.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-gvDNHl8dBa.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-K46XCDxOjE.jpg\"]', '[{\"key\":\"Bright White__L\",\"color\":\"Bright White\",\"size\":\"L\",\"sku\":\"1971-ASH-002 (5 PCS set)-BRIGHT-WHITE-L\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Bright White__M\",\"color\":\"Bright White\",\"size\":\"M\",\"sku\":\"1971-ASH-002 (5 PCS set)-BRIGHT-WHITE-M\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Bright White__S\",\"color\":\"Bright White\",\"size\":\"S\",\"sku\":\"1971-ASH-002 (5 PCS set)-BRIGHT-WHITE-S\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Bright White__XL\",\"color\":\"Bright White\",\"size\":\"XL\",\"sku\":\"1971-ASH-002 (5 PCS set)-BRIGHT-WHITE-XL\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Bright White__XXL\",\"color\":\"Bright White\",\"size\":\"XXL\",\"sku\":\"1971-ASH-002 (5 PCS set)-BRIGHT-WHITE-XXL\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Mountain Blue__L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"sku\":\"1971-ASH-002 (5 PCS set)-MOUNTAIN-BLUE-L\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Mountain Blue__M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"sku\":\"1971-ASH-002 (5 PCS set)-MOUNTAIN-BLUE-M\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Mountain Blue__S\",\"color\":\"Mountain Blue\",\"size\":\"S\",\"sku\":\"1971-ASH-002 (5 PCS set)-MOUNTAIN-BLUE-S\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Mountain Blue__XL\",\"color\":\"Mountain Blue\",\"size\":\"XL\",\"sku\":\"1971-ASH-002 (5 PCS set)-MOUNTAIN-BLUE-XL\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Mountain Blue__XXL\",\"color\":\"Mountain Blue\",\"size\":\"XXL\",\"sku\":\"1971-ASH-002 (5 PCS set)-MOUNTAIN-BLUE-XXL\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"gray__L\",\"color\":\"gray\",\"size\":\"L\",\"sku\":\"1971-ASH-002 (5 PCS set)-GRAY-L\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"gray__M\",\"color\":\"gray\",\"size\":\"M\",\"sku\":\"1971-ASH-002 (5 PCS set)-GRAY-M\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"gray__S\",\"color\":\"gray\",\"size\":\"S\",\"sku\":\"1971-ASH-002 (5 PCS set)-GRAY-S\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"gray__XL\",\"color\":\"gray\",\"size\":\"XL\",\"sku\":\"1971-ASH-002 (5 PCS set)-GRAY-XL\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"gray__XXL\",\"color\":\"gray\",\"size\":\"XXL\",\"sku\":\"1971-ASH-002 (5 PCS set)-GRAY-XXL\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Black Beauty__L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"sku\":\"1971-ASH-002 (5 PCS set)-BLACK-BEAUTY-L\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Black Beauty__M\",\"color\":\"Black Beauty\",\"size\":\"M\",\"sku\":\"1971-ASH-002 (5 PCS set)-BLACK-BEAUTY-M\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Black Beauty__S\",\"color\":\"Black Beauty\",\"size\":\"S\",\"sku\":\"1971-ASH-002 (5 PCS set)-BLACK-BEAUTY-S\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Black Beauty__XL\",\"color\":\"Black Beauty\",\"size\":\"XL\",\"sku\":\"1971-ASH-002 (5 PCS set)-BLACK-BEAUTY-XL\",\"stock\":\"100\",\"price\":\"59.99\"},{\"key\":\"Black Beauty__XXL\",\"color\":\"Black Beauty\",\"size\":\"XXL\",\"sku\":\"1971-ASH-002 (5 PCS set)-BLACK-BEAUTY-XXL\",\"stock\":\"100\",\"price\":\"59.99\"}]', '{\"Bright White\":[\"\\/uploads\\/products\\/gallery\\/20260616072008-1zUPM02LSz.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-lyP0dja6CO.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-CVKY8K9PJT.jpg\"],\"Mountain Blue\":[\"\\/uploads\\/products\\/gallery\\/20260616072008-GMe5ySUD9j.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-1BdlGWAgYW.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-M1cce3nGOD.jpg\"],\"gray\":[\"\\/uploads\\/products\\/gallery\\/20260616072008-SC1jZkSDK8.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-3zUySr1D9x.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-YoEstF4nLQ.jpg\"],\"Black Beauty\":[\"\\/uploads\\/products\\/gallery\\/20260616072008-cRqvT2IPWP.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-gvDNHl8dBa.jpg\",\"\\/uploads\\/products\\/gallery\\/20260616072008-K46XCDxOjE.jpg\"]}', 7, 2, 8, 'Elevate your workout wardrobe with our Athletic Shorts Bundle. This 5-piece pack includes 2 Grey, 2 Black, and 1 Mountain Blue pair giving you versatile color options for every training session. Each pair features breathable fabric, a secure fit, and functional pockets to keep you moving. Whether you\'re hitting the gym, running outdoors, or training hard, you\'ll have the perfect shorts on hand. Perfect for athletes who demand quality and variety without breaking the bank. Stock up and save with this complete bundle.', NULL, NULL, NULL, NULL, '<p>Classic-fit athletic shorts made from lightweight polyester fabric. Designed for comfort in and out of water, featuring an elastic waistband, adjustable drawstring, and functional side pockets.</p>', '<p>Machine wash cold with similar colors. Do not bleach. Tumble dry low. Remove promptly. Iron at medium temperature if needed.</p>');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'super-admin', '2026-06-06 03:32:51', '2026-06-06 03:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `role_user`
--

CREATE TABLE `role_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_user`
--

INSERT INTO `role_user` (`id`, `role_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-06-06 03:32:51', '2026-06-06 03:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('Uj7PSqrVUcUvNdTed8ydwESJfHgbU6OuSj57DoHV', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJVOUlqSDJkNGVBS0k1cko4ZEFmVzZvOXZObzh2R2lBMll5V3dwNVVnIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJ1cmwiOnsiaW50ZW5kZWQiOiJodHRwOlwvXC9sb2NhbGhvc3Q6ODAwMFwvYWRtaW5cL3Byb2R1Y3RzIn0sIl9wcmV2aW91cyI6eyJ1cmwiOiJodHRwOlwvXC9sb2NhbGhvc3Q6ODAwMFwvdXBsb2Fkc1wvcHJvZHVjdHNcL2dhbGxlcnlcLzIwMjYwNjE2MDQ0OTMzLTBXY0Y1MkRBRm4uanBnIiwicm91dGUiOm51bGx9LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MSwicGFzc3dvcmRfaGFzaF93ZWIiOiJlOTgyNmIwZDczOGJkOTZmZTgwZGMwNTEzOGIwODAxMGY1YTJhYWUzMzdiNzUxYWU0MDcxMmM0ZDYyZDhiZGFlIn0=', 1781698773);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `payload`, `created_at`, `updated_at`) VALUES
(1, '{\"header_logo\":\"\\/uploads\\/settings\\/logos\\/20260614113514-61d2f13a8a.webp\",\"footer_logo\":\"\\/uploads\\/settings\\/logos\\/20260614113048-fffb20cbf3.webp\",\"email\":\"hello@1971co.com\",\"location\":\"America\",\"currency\":\"$\",\"social_media\":[],\"frontend_utils\":{\"best_sellers_section\":{\"title\":\"Best Sellers\",\"position\":3}}}', '2026-06-14 05:30:48', '2026-06-14 07:07:08');

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `Size` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`id`, `Size`, `created_at`, `updated_at`) VALUES
(1, 'S', '2026-06-14 01:48:27', '2026-06-14 01:48:27'),
(2, 'M', '2026-06-14 01:56:43', '2026-06-14 01:56:43'),
(3, 'L', '2026-06-14 01:56:48', '2026-06-15 01:19:12'),
(4, 'XL', '2026-06-14 01:56:53', '2026-06-14 01:56:53'),
(5, 'XXL', '2026-06-14 01:56:59', '2026-06-14 01:56:59');

-- --------------------------------------------------------

--
-- Table structure for table `sub_categories`
--

CREATE TABLE `sub_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `name`, `slug`, `category_id`, `created_at`, `updated_at`) VALUES
(1, 'Tops', 'tops', 7, '2026-06-13 04:39:43', '2026-06-13 04:39:43'),
(2, 'Bottom & More', 'bottom-more', 7, '2026-06-13 04:39:56', '2026-06-13 04:39:56'),
(3, 'Bundles', 'bundles', 7, '2026-06-13 04:40:24', '2026-06-13 04:40:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` varchar(255) NOT NULL DEFAULT 'customer',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `first_name`, `last_name`, `email`, `email_verified_at`, `password`, `user_type`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Admin', '', 'admin@gmail.com', NULL, '$2y$12$xjHIF7h1UKm3raSpGlpAa.TZToYTOgX9TibRtcTBZ8vFlpDkyQFou', 'admin', NULL, NULL, NULL),
(2, 'Shifat E Rasul', 'Shifat E', 'Rasul', 'shifaterasulbd@gmail.com', NULL, '$2y$12$IXKZTjiVKCg9f483b/vI5.0Qs0sMxWrB6IFz9A0eybwn5x4DE8WRC', 'customer', NULL, '2026-06-16 07:17:27', '2026-06-16 07:17:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `about_giving_back_sections`
--
ALTER TABLE `about_giving_back_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_hero_sections`
--
ALTER TABLE `about_hero_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_mission_sections`
--
ALTER TABLE `about_mission_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_story_sections`
--
ALTER TABLE `about_story_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- Indexes for table `checkout_orders`
--
ALTER TABLE `checkout_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `checkout_orders_order_number_unique` (`order_number`),
  ADD KEY `checkout_orders_user_id_foreign` (`user_id`);

--
-- Indexes for table `collection_items`
--
ALTER TABLE `collection_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `collection_items_collection_section_id_foreign` (`collection_section_id`);

--
-- Indexes for table `collection_sections`
--
ALTER TABLE `collection_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `colors_name_unique` (`name`),
  ADD UNIQUE KEY `colors_color_code_unique` (`color_code`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `features`
--
ALTER TABLE `features`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `grand_childs`
--
ALTER TABLE `grand_childs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `heroes`
--
ALTER TABLE `heroes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `our_story_sections`
--
ALTER TABLE `our_story_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_slug_unique` (`slug`);

--
-- Indexes for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permission_role_permission_id_role_id_unique` (`permission_id`,`role_id`),
  ADD KEY `permission_role_role_id_foreign` (`role_id`);

--
-- Indexes for table `personalizations`
--
ALTER TABLE `personalizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personalizations_user_id_foreign` (`user_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD KEY `products_name_sku_index` (`name`,`sku`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_slug_unique` (`slug`);

--
-- Indexes for table `role_user`
--
ALTER TABLE `role_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_user_role_id_user_id_unique` (`role_id`,`user_id`),
  ADD KEY `role_user_user_id_foreign` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sub_categories_slug_unique` (`slug`),
  ADD KEY `sub_categories_category_id_foreign` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_user_type_index` (`user_type`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `about_giving_back_sections`
--
ALTER TABLE `about_giving_back_sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `about_hero_sections`
--
ALTER TABLE `about_hero_sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `about_mission_sections`
--
ALTER TABLE `about_mission_sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `about_story_sections`
--
ALTER TABLE `about_story_sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `checkout_orders`
--
ALTER TABLE `checkout_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `collection_items`
--
ALTER TABLE `collection_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `collection_sections`
--
ALTER TABLE `collection_sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `colors`
--
ALTER TABLE `colors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `features`
--
ALTER TABLE `features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `grand_childs`
--
ALTER TABLE `grand_childs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `heroes`
--
ALTER TABLE `heroes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `our_story_sections`
--
ALTER TABLE `our_story_sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `permission_role`
--
ALTER TABLE `permission_role`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `personalizations`
--
ALTER TABLE `personalizations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `role_user`
--
ALTER TABLE `role_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sub_categories`
--
ALTER TABLE `sub_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `checkout_orders`
--
ALTER TABLE `checkout_orders`
  ADD CONSTRAINT `checkout_orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `collection_items`
--
ALTER TABLE `collection_items`
  ADD CONSTRAINT `collection_items_collection_section_id_foreign` FOREIGN KEY (`collection_section_id`) REFERENCES `collection_sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `personalizations`
--
ALTER TABLE `personalizations`
  ADD CONSTRAINT `personalizations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `role_user`
--
ALTER TABLE `role_user`
  ADD CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD CONSTRAINT `sub_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
