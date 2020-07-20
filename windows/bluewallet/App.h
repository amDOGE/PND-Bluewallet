#pragma once

#include "App.xaml.g.h"

namespace winrt::bluewallet::implementation
{
    struct App : AppT<App>
    {
        App() noexcept;
    };
} // namespace winrt::bluewallet::implementation


