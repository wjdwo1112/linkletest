import { MagnifyingGlassIcon, ChatBubbleBottomCenterTextIcon, HomeIcon, UserGroupIcon, PhotoIcon, PlusIcon, UserIcon, HeartIcon, ShareIcon, BookmarkIcon, EllipsisHorizontalIcon, ChevronRightIcon, MapPinIcon, CalendarIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';

// 기본 아이콘 컴포넌트
const IconBase = ({ icon: Icon, className = 'w-6 h-6', ...props }) => <Icon className={className} {...props} />;

// 자주 사용될 아이콘들을 개별 컴포넌트로 export
export const SearchIcon = (props) => <IconBase icon={MagnifyingGlassIcon} {...props} />;
export const ChatIcon = (props) => <IconBase icon={ChatBubbleBottomCenterTextIcon} {...props} />;
export const Home = (props) => <IconBase icon={HomeIcon} {...props} />;
export const UserGroup = (props) => <IconBase icon={UserGroupIcon} {...props} />;
export const Photo = (props) => <IconBase icon={PhotoIcon} {...props} />;
export const Plus = (props) => <IconBase icon={PlusIcon} {...props} />;
export const User = (props) => <IconBase icon={UserIcon} {...props} />;
export const Heart = (props) => <IconBase icon={HeartIcon} {...props} />;
export const Share = (props) => <IconBase icon={ShareIcon} {...props} />;
export const Bookmark = (props) => <IconBase icon={BookmarkIcon} {...props} />;
export const MoreHorizontal = (props) => <IconBase icon={EllipsisHorizontalIcon} {...props} />;
export const ChevronRight = (props) => <IconBase icon={ChevronRightIcon} {...props} />;
export const MapPin = (props) => <IconBase icon={MapPinIcon} {...props} />;
export const Calendar = (props) => <IconBase icon={CalendarIcon} {...props} />;
export const Clock = (props) => <IconBase icon={ClockIcon} {...props} />;
export const Users = (props) => <IconBase icon={UsersIcon} {...props} />;
