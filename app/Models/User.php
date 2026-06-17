<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'user_type',
        'warehouse_ids',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'warehouse_ids' => 'array',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    public function isCustomer(): bool
    {
        return $this->user_type === 'customer';
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function hasRole(string $role): bool
    {
        $normalizedRole = strtolower(trim($role));
        if ($normalizedRole === '') {
            return false;
        }

        return $this->roles()
            ->whereRaw('LOWER(slug) = ?', [$normalizedRole])
            ->orWhereRaw('LOWER(name) = ?', [$normalizedRole])
            ->exists();
    }

    public function hasAnyRole(array $roles): bool
    {
        $normalizedRoles = array_values(array_unique(array_filter(array_map(
            static fn ($role) => strtolower(trim((string) $role)),
            $roles
        ))));

        if ($normalizedRoles === []) {
            return false;
        }

        return $this->roles()
            ->whereIn('slug', $normalizedRoles)
            ->orWhereIn('name', $normalizedRoles)
            ->exists();
    }
}
